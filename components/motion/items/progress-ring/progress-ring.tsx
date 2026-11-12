import './progress-ring.css';

export interface ProgressRingProps {
  /** 0 to 100. */
  value: number;
  /** Accessible name, for example "Upload progress". */
  label: string;
  /** Diameter in pixels. */
  size?: number;
  /** Ring thickness in pixels. */
  stroke?: number;
  className?: string;
}

/** A ring that animates to the given percentage. */
export function ProgressRing({
  value,
  label,
  size = 120,
  stroke = 10,
  className = '',
}: ProgressRingProps) {
  const percent = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      className={`mg-ring ${className}`}
      role='progressbar'
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden='true'
      >
        <circle
          className='mg-ring__track'
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
        />
        <circle
          className='mg-ring__value'
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - percent / 100)}
        />
      </svg>
      <span className='mg-ring__label' aria-hidden='true'>
        {Math.round(percent)}%
      </span>
    </div>
  );
}
