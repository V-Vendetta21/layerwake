import type { ButtonHTMLAttributes } from 'react';
import './toggle-icon-morph.css';

export interface ToggleIconMorphProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange'
> {
  /** Current state: false shows a plus, true shows a close mark. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Stays the same in both states; the state is announced separately. */
  label: string;
  /**
   * "expanded" for a button that shows and hides something (pass
   * `aria-controls` too); "pressed" for an on/off toggle.
   */
  mode?: 'expanded' | 'pressed';
}

/** A fixed-size button whose plus turns into a close mark. */
export function ToggleIconMorph({
  open,
  onOpenChange,
  label,
  mode = 'expanded',
  className = '',
  ...rest
}: ToggleIconMorphProps) {
  const state =
    mode === 'expanded' ? { 'aria-expanded': open } : { 'aria-pressed': open };
  return (
    <button
      type='button'
      className={`mg-morph ${className}`}
      aria-label={label}
      data-open={open}
      onClick={() => onOpenChange(!open)}
      {...state}
      {...rest}
    >
      <span className='mg-morph__bar' aria-hidden='true' />
      <span className='mg-morph__bar mg-morph__bar--v' aria-hidden='true' />
    </button>
  );
}
