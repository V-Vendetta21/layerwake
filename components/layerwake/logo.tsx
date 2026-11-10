/** The Layerwake mark: two offset panels and a short green trail. */
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
        fill='#F5F8FF'
        stroke='#0C1738'
        strokeWidth='2'
      />
      <rect x='11' y='11' width='18' height='18' rx='4' fill='#164CFF' />
      <path
        d='M3.5 27.5h6'
        stroke='#B6FF3B'
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
