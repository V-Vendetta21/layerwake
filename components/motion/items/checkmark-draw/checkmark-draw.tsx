import './checkmark-draw.css';

export interface CheckmarkDrawProps {
  /** True draws the ring, then the tick. False clears both. */
  done: boolean;
  /** Text shown and announced once done, for example "Payment received". */
  label: string;
  size?: number;
  className?: string;
}

/** A ring and a check mark drawn stroke by stroke, with matching text. */
export function CheckmarkDraw({
  done,
  label,
  size = 88,
  className = '',
}: CheckmarkDrawProps) {
  return (
    <div className={`mg-checkmark ${className}`} data-done={done}>
      <svg width={size} height={size} viewBox='0 0 52 52' aria-hidden='true'>
        <circle
          className='mg-checkmark__ring'
          cx='26'
          cy='26'
          r='23'
          pathLength={1}
        />
        <path
          className='mg-checkmark__tick'
          d='M15 27 L23 34 L38 18'
          pathLength={1}
        />
      </svg>
      <p className='mg-checkmark__label' role='status'>
        {done ? label : ''}
      </p>
    </div>
  );
}
