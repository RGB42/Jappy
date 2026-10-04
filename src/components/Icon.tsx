// Schlanke Inline-SVG-Icons (keine externen Abhängigkeiten, offline-fähig).
const PATHS: Record<string, string> = {
  speaker: 'M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z',
  mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.9V22h2v-3.1a7 7 0 0 0 6-6.9h-2z',
  play: 'M8 5v14l11-7z',
  pause: 'M6 5h4v14H6zm8 0h4v14h-4z',
  stop: 'M6 6h12v12H6z',
  record: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  slow: 'M3 15c0-4 3.6-7 8-7s8 3 8 7H3zm16.5-4.5a2 2 0 1 1 0 4M6 17v2m10-2v2',
  repeat: 'M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4zM7 7h10v3l4-4-4-4v3H5v6h2V7z',
  check: 'M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z',
  close: 'M19 6.4 17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z',
  back: 'M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12z',
  next: 'M8.6 16.6 10 18l6-6-6-6-1.4 1.4 4.6 4.6z',
  settings:
    'M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a7.3 7.3 0 0 0-1.7-1L15 3.3h-4l-.4 2.7a7.3 7.3 0 0 0-1.7 1l-2.5-1-2 3.4L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1c.5.4 1.1.7 1.7 1l.4 2.7h4l.4-2.7c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.4zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z',
  home: 'M12 3 2 12h3v8h5v-6h4v6h5v-8h3z',
  path: 'M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM7 10v2a4 4 0 0 0 4 4h2a2 2 0 0 1 2 2h2a4 4 0 0 0-4-4h-2a2 2 0 0 1-2-2v-2H7z',
  practice: 'M20.6 14.9 22 13.5 20.6 12l-3.6 3.6-8.5-8.5L12 3.5 10.6 2 9.1 3.4 7.7 2 5.5 4.2 4.1 2.8 2.8 4.1l1.4 1.4L2 7.7l1.4 1.4L2 10.6 3.4 12l3.6-3.6 8.5 8.5L12 20.5l1.4 1.5 1.5-1.4 1.4 1.4 2.2-2.2 1.4 1.4 1.3-1.3-1.4-1.4 2.2-2.2z',
  chart: 'M5 9h3v11H5zm5.5-5h3v16h-3zM16 13h3v7h-3z',
  eye: 'M12 5C7 5 2.7 8.1 1 12.5 2.7 16.9 7 20 12 20s9.3-3.1 11-7.5C21.3 8.1 17 5 12 5zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  headphones: 'M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h3v-8H5v-1a7 7 0 0 1 14 0v1h-3v8h3a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z',
  bulb: 'M9 21h6v-1H9v1zm3-19a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2z',
  fire: 'M13.5.7s.7 2.6.7 4.8c0 2-1.3 3.7-3.4 3.7S7.3 7.5 7.3 5.5v-.3A13 13 0 0 0 4 14a8 8 0 0 0 16 0c0-5.4-2.6-10.2-6.5-13.3zM11.7 19c-1.8 0-3.2-1.4-3.2-3.1 0-1.6 1-2.8 2.8-3.1 1.8-.4 3.6-1.2 4.6-2.6.4 1.3.6 2.6.6 4 0 2.6-2.1 4.8-4.8 4.8z',
  shuffle: 'M10.6 9.2 5.4 4 4 5.4l5.2 5.2 1.4-1.4zM14.5 4l2 2L4 18.6 5.4 20 18 7.5l2 2V4h-5.5zm.3 9.4-1.4 1.4 3.1 3.1-2 2H20v-5.5l-2 2-3.2-3z',
  undo: 'M12.5 8c-2.7 0-5 1-6.9 2.6L2 7v9h9l-3.6-3.6A8 8 0 0 1 20.1 16l2.3-.8A10.5 10.5 0 0 0 12.5 8z',
};

export function Icon({ name, size = 22, className }: { name: keyof typeof PATHS | string; size?: number; className?: string }) {
  const d = PATHS[name];
  const stroke = name === 'slow';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : 'none'}
      strokeWidth={stroke ? 2 : 0}
      strokeLinecap="round"
    >
      <path d={d} />
    </svg>
  );
}
