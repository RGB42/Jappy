// Nachbau der benutzten Supabase-Schnittstellen (Auth + Tabelle „progress“) für Tests – im Speicher.
export interface FakeRequest {
  method: string;
  url: string; // Pfad + Query
  headers: Record<string, string>;
  body?: string;
}

export interface FakeResponse {
  status: number;
  body?: unknown;
}

interface Row {
  user_id: string;
  data: unknown;
  rev: number;
  device?: string;
  updated_at: string;
}

/** Sortiert Objektschlüssel um – wie jsonb in Postgres. */
function reorder(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(reorder);
  if (v && typeof v === 'object') {
    const keys = Object.keys(v).sort((a, b) => a.length - b.length || (a < b ? -1 : 1));
    return Object.fromEntries(keys.map((k) => [k, reorder((v as Record<string, unknown>)[k])]));
  }
  return v;
}

export function createFakeSupabase(opts: { confirmEmail?: boolean; tokenTtl?: number } = {}) {
  const users = new Map<string, { id: string; email: string; password: string; name?: string; confirmed: boolean }>();
  const tokens = new Map<string, { userId: string; exp: number }>();
  const refreshTokens = new Map<string, string>();
  const rows = new Map<string, Row>();
  let n = 0;
  const log: string[] = [];

  const session = (userId: string) => {
    const u = [...users.values()].find((x) => x.id === userId)!;
    const access = `at-${++n}`;
    const refresh = `rt-${n}`;
    const ttl = opts.tokenTtl ?? 3600;
    tokens.set(access, { userId, exp: Date.now() + ttl * 1000 });
    refreshTokens.set(refresh, userId);
    return {
      access_token: access,
      refresh_token: refresh,
      expires_in: ttl,
      expires_at: Math.floor(Date.now() / 1000) + ttl,
      user: { id: u.id, email: u.email, user_metadata: u.name ? { name: u.name } : {} },
    };
  };

  const authUser = (h: Record<string, string>) => {
    const t = (h.authorization ?? h.Authorization ?? '').replace(/^Bearer /, '');
    const tok = tokens.get(t);
    return tok && tok.exp > Date.now() ? tok.userId : null;
  };

  function handle(req: FakeRequest): FakeResponse {
    const u = new URL(req.url, 'http://fake');
    const q = u.searchParams;
    const body = req.body ? (JSON.parse(req.body) as Record<string, unknown>) : {};
    log.push(`${req.method} ${u.pathname}${u.search}`);
    const uid = authUser(req.headers);

    switch (`${req.method} ${u.pathname}`) {
      case 'POST /auth/v1/signup': {
        const email = String(body.email).toLowerCase();
        if ([...users.values()].some((x) => x.email === email)) return { status: 422, body: { code: 422, error_code: 'user_already_exists', msg: 'User already registered' } };
        if (String(body.password).length < 6) return { status: 422, body: { error_code: 'weak_password', msg: 'Password should be at least 6 characters.' } };
        const id = `user-${++n}`;
        users.set(email, { id, email, password: String(body.password), name: (body.data as { name?: string })?.name, confirmed: !opts.confirmEmail });
        if (opts.confirmEmail) return { status: 200, body: { id, email } };
        return { status: 200, body: session(id) };
      }
      case 'POST /auth/v1/token': {
        if (q.get('grant_type') === 'password') {
          const user = users.get(String(body.email).toLowerCase());
          if (!user || user.password !== body.password) return { status: 400, body: { error_code: 'invalid_credentials', msg: 'Invalid login credentials' } };
          if (!user.confirmed) return { status: 400, body: { error_code: 'email_not_confirmed', msg: 'Email not confirmed' } };
          return { status: 200, body: session(user.id) };
        }
        const userId = refreshTokens.get(String(body.refresh_token));
        if (!userId) return { status: 400, body: { error_code: 'refresh_token_not_found', msg: 'Invalid Refresh Token' } };
        refreshTokens.delete(String(body.refresh_token));
        return { status: 200, body: session(userId) };
      }
      case 'GET /auth/v1/user':
      case 'PUT /auth/v1/user': {
        if (!uid) return { status: 401, body: { msg: 'invalid JWT' } };
        const user = [...users.values()].find((x) => x.id === uid)!;
        if (req.method === 'PUT') {
          if (body.password) user.password = String(body.password);
          if ((body.data as { name?: string })?.name !== undefined) user.name = (body.data as { name: string }).name;
        }
        return { status: 200, body: { id: user.id, email: user.email, user_metadata: user.name ? { name: user.name } : {} } };
      }
      case 'POST /auth/v1/logout':
        return { status: 204 };
      case 'POST /auth/v1/recover':
        return { status: 200, body: {} };
      case 'GET /rest/v1/progress': {
        if (!uid) return { status: 401, body: { message: 'JWT expired' } };
        const row = rows.get(uid);
        const cols = (q.get('select') ?? '*').split(',');
        return { status: 200, body: row ? [Object.fromEntries(Object.entries(row).filter(([k]) => cols.includes('*') || cols.includes(k)))] : [] };
      }
      case 'POST /rest/v1/progress': {
        if (!uid || body.user_id !== uid) return { status: 401, body: { message: 'RLS' } };
        if (rows.has(uid)) return { status: 409, body: { code: '23505', message: 'duplicate key' } };
        rows.set(uid, { user_id: uid, data: reorder(body.data), rev: Number(body.rev ?? 1), device: body.device as string, updated_at: new Date().toISOString() });
        return { status: 201 };
      }
      case 'PATCH /rest/v1/progress': {
        if (!uid) return { status: 401, body: { message: 'JWT expired' } };
        const row = rows.get(uid);
        const rev = Number(q.get('rev')?.replace('eq.', ''));
        if (!row || row.user_id !== q.get('user_id')?.replace('eq.', '') || row.rev !== rev) return { status: 200, body: [] };
        Object.assign(row, { data: reorder(body.data), rev: Number(body.rev), device: body.device, updated_at: String(body.updated_at) });
        return { status: 200, body: [{ rev: row.rev }] };
      }
      case 'POST /rest/v1/rpc/delete_account': {
        if (!uid) return { status: 401 };
        rows.delete(uid);
        for (const [k, v] of users) if (v.id === uid) users.delete(k);
        return { status: 204 };
      }
    }
    return { status: 404, body: { message: `unbekannt: ${req.method} ${u.pathname}` } };
  }

  /** fetch-kompatible Funktion (für vi.stubGlobal). */
  const fetchImpl = async (input: string | URL | Request, init: RequestInit = {}): Promise<Response> => {
    const url = new URL(String(input));
    const headers = Object.fromEntries(Object.entries((init.headers ?? {}) as Record<string, string>).map(([k, v]) => [k.toLowerCase(), v]));
    const res = handle({ method: init.method ?? 'GET', url: url.pathname + url.search, headers, body: init.body as string | undefined });
    return new Response(res.body === undefined ? null : JSON.stringify(res.body), { status: res.status });
  };

  return { handle, fetch: fetchImpl, rows, users, log, confirm: (email: string) => (users.get(email)!.confirmed = true) };
}
