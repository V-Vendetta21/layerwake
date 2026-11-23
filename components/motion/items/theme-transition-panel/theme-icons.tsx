/** Sun and moon, drawn on a 20px grid. They inherit the button's colour. */
export function SunIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 20 20'
      aria-hidden='true'
      focusable='false'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.6'
      strokeLinecap='round'
    >
      <circle cx='10' cy='10' r='3.5' />
      <path d='M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4' />
    </svg>
  );
}

export function MoonIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 20 20'
      aria-hidden='true'
      focusable='false'
    >
      <path
        d='M15.5 12.5A6.5 6.5 0 0 1 7.5 4.5a6.5 6.5 0 1 0 8 8Z'
        fill='currentColor'
      />
    </svg>
  );
}
