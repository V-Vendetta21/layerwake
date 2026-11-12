/** The Layerwake mark: two offset panels and a short electric-blue trail. */
export function LayerwakeMark({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 32 32'
      fill='none'
      aria-hidden='true'
      focusable='false'
    >
      <rect
        x='3'
        y='3'
        width='18'
        height='18'
        rx='4'
        fill='#1b1b1b'
        stroke='#ffffff'
        strokeWidth='2'
      />
      <rect x='11' y='11' width='18' height='18' rx='4' fill='#0047ff' />
      <path
        d='M3.5 27.5h6'
        stroke='#648aff'
        strokeWidth='3'
        strokeLinecap='round'
      />
    </svg>
  );
}

export function LayerwakeBrand({ size = 24 }: { size?: number }) {
  return (
    <span className='lw-brand'>
      <LayerwakeMark size={size} />
      Layerwake
    </span>
  );
}
