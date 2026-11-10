'use client';

import type { CSSProperties } from 'react';
import './animated-stepper.css';

export interface StepperProps {
  steps: string[];
  /** Index of the current step, starting at 0. */
  current: number;
  /** Called when a step is chosen directly. */
  onStepChange: (index: number) => void;
  /** Accessible name for the list of steps. */
  label: string;
  className?: string;
}

/** Numbered steps joined by a line that fills as the user moves forward. */
export function Stepper({
  steps,
  current,
  onStepChange,
  label,
  className = '',
}: StepperProps) {
  const progress = steps.length > 1 ? current / (steps.length - 1) : 1;
  return (
    <ol
      className={`mg-stepper ${className}`}
      aria-label={label}
      style={
        {
          '--mg-count': steps.length,
          '--mg-progress': progress,
        } as CSSProperties
      }
    >
      {steps.map((step, index) => {
        const state =
          index < current ? 'done' : index === current ? 'current' : 'upcoming';
        return (
          <li key={step} className='mg-stepper__step' data-state={state}>
            <button
              type='button'
              className='mg-stepper__button'
              aria-current={state === 'current' ? 'step' : undefined}
              aria-label={`Step ${index + 1} of ${steps.length}: ${step}${
                state === 'done' ? ' (completed)' : ''
              }`}
              onClick={() => onStepChange(index)}
            >
              <span className='mg-stepper__dot' aria-hidden='true'>
                {state === 'done' ? '✓' : index + 1}
              </span>
              <span className='mg-stepper__name' aria-hidden='true'>
                {step}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
