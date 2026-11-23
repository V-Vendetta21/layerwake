/**
 * The Layerwake mark: two offset panels and a short trail. It takes its colors
 * from the theme tokens, so it reads on both the dark and the light canvas.
 */
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
        strokeWidth='2'
        style={{ fill: 'var(--lw-raised)', stroke: 'var(--lw-text)' }}
      />
      <rect
        x='11'
        y='11'
        width='18'
        height='18'
        rx='4'
        style={{ fill: 'var(--lw-accent)' }}
      />
      <path
        d='M3.5 27.5h6'
        strokeWidth='3'
        strokeLinecap='round'
        style={{ stroke: 'var(--lw-accent-text)' }}
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
