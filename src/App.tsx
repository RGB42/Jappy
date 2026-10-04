import { useEffect, type ReactNode } from 'react';
import { Icon } from './components/Icon';
import { navigate, useRoute } from './lib/router';
import { useAppState } from './lib/store';
import { AudioLesson } from './screens/AudioLesson';
import { Builder } from './screens/Builder';
import { DialogueList, DialoguePlayer } from './screens/Dialogue';
import { GrammarDetail, GrammarList } from './screens/Grammar';
import { Home } from './screens/Home';
import { KanaDraw } from './screens/KanaDraw';
import { KanaHub } from './screens/KanaHub';
import { KanaQuiz } from './screens/KanaQuiz';
import { LearnSession } from './screens/LearnSession';
import { Listening } from './screens/Listening';
import { Methods } from './screens/Methods';
import { MinimalPairs } from './screens/MinimalPairs';
import { Onboarding } from './screens/Onboarding';
import { Path } from './screens/Path';
import { Practice } from './screens/Practice';
import { Review } from './screens/Review';
import { Settings } from './screens/Settings';
import { Shadowing } from './screens/Shadowing';
import { Stats } from './screens/Stats';
import { StoryList, StoryPlayer } from './screens/Story';
import { Words } from './screens/Words';

const TABS = [
  { path: '/', label: 'Heute', icon: 'home' },
  { path: '/path', label: 'Lernpfad', icon: 'path' },
  { path: '/practice', label: 'Üben', icon: 'practice' },
  { path: '/stats', label: 'Fortschritt', icon: 'chart' },
];

const ROUTES: Record<string, () => ReactNode> = {
  '/': () => <Home />,
  '/path': () => <Path />,
  '/practice': () => <Practice />,
  '/stats': () => <Stats />,
  '/settings': () => <Settings />,
  '/methods': () => <Methods />,
  '/learn': () => <LearnSession />,
  '/review': () => <Review />,
  '/words': () => <Words />,
  '/kana': () => <KanaHub />,
  '/kana/quiz': () => <KanaQuiz />,
  '/kana/draw': () => <KanaDraw />,
  '/listen': () => <Listening />,
  '/pairs': () => <MinimalPairs />,
  '/shadow': () => <Shadowing />,
  '/dialogues': () => <DialogueList />,
  '/dialogue': () => <DialoguePlayer />,
  '/stories': () => <StoryList />,
  '/story': () => <StoryPlayer />,
  '/grammar': () => <GrammarList />,
  '/grammar/point': () => <GrammarDetail />,
  '/build': () => <Builder />,
  '/audio': () => <AudioLesson />,
};

export function App() {
  const state = useAppState();
  const route = useRoute();
  const theme = state.settings.theme;

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);
  }, [theme]);

  if (!state.onboarded) {
    return (
      <div className="app no-tabs">
        <Onboarding />
      </div>
    );
  }

  const render = ROUTES[route.path] ?? ROUTES['/'];
  const isTab = TABS.some((t) => t.path === route.path);

  return (
    <>
      <main className={`app ${isTab ? '' : 'no-tabs'}`} key={route.path + route.params.toString()}>
        {render()}
      </main>
      {isTab && (
        <nav className="tabbar" aria-label="Hauptnavigation">
          <div className="tabbar-inner">
            {TABS.map((t) => (
              <button
                key={t.path}
                className={`tab ${route.path === t.path ? 'active' : ''}`}
                onClick={() => navigate(t.path)}
                aria-current={route.path === t.path ? 'page' : undefined}
              >
                <Icon name={t.icon} size={24} />
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </>
  );
}
