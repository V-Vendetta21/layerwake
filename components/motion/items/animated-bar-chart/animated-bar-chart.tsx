import type { CSSProperties } from 'react';
import './animated-bar-chart.css';

export interface BarDatum {
  /** Stable key: bars keep their identity and color across datasets. */
  id: string;
  label: string;
  value: number;
}

export interface AnimatedBarChartProps {
  data: BarDatum[];
  /** Top of the scale. Keep it fixed so bars compare across datasets. */
  max: number;
  unit?: string;
  /** Accessible name, for example "Wind speed by day". */
  label: string;
  className?: string;
}

/**
 * Bars grow or shrink to new values, keyed by `id` so each category keeps its
 * place. Every bar prints its exact value. Rapid changes simply retarget.
 */
export function AnimatedBarChart({
  data,
  max,
  unit = '',
  label,
  className = '',
}: AnimatedBarChartProps) {
  return (
    <figure className={`mg-bars ${className}`}>
      <figcaption className='mg-bars__caption'>{label}</figcaption>
      <ul className='mg-bars__list'>
        {data.map((d) => (
          <li
            key={d.id}
            className='mg-bars__item'
            style={
              {
                '--mg-value': Math.max(0, Math.min(1, d.value / max)),
              } as CSSProperties
            }
          >
            <span className='mg-bars__value'>
              {d.value}
              {unit}
            </span>
            <span className='mg-bars__track' aria-hidden='true'>
              <span className='mg-bars__bar' />
            </span>
            <span className='mg-bars__label'>{d.label}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
