/**
 * Layerwake's icon set: 16px grid, 1.5px stroke, round caps. Icons inherit
 * `currentColor` and are always decorative (pair them with visible text or
 * an accessible name on the control).
 */
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 16, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 16 16'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      focusable='false'
      {...rest}
    >
      {children}
    </svg>
  );
}

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M4 4l8 8M12 4l-8 8' />
  </Icon>
);

export const ReplayIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M3.5 8a4.5 4.5 0 1 0 1.4-3.3' />
    <path d='M3 2.5v2.8h2.8' />
  </Icon>
);

export const ResetIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M12.5 8a4.5 4.5 0 1 1-1.4-3.3' />
    <path d='M13 2.5v2.8h-2.8' />
  </Icon>
);

/** A pointer touching a surface: "how to interact". */
export const InteractIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M6 8.5V3.2a1.2 1.2 0 0 1 2.4 0v4.3' />
    <path d='M8.4 6.6a1.2 1.2 0 0 1 2.4 0v1.2' />
    <path d='M10.8 7.4a1.2 1.2 0 0 1 2.2.6V10a4 4 0 0 1-4 4H8.3a3.5 3.5 0 0 1-2.9-1.6L3.2 9.2a1.1 1.1 0 0 1 1.8-1.3L6 9.2' />
  </Icon>
);

export const ContainerIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x='2.5' y='3' width='11' height='10' rx='1.5' />
  </Icon>
);

export const TextIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M3.5 4h9M8 4v8.5' />
  </Icon>
);

export const ImageIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x='2.5' y='3' width='11' height='10' rx='1.5' />
    <path d='M2.8 11l3.2-3 2.5 2.3 1.6-1.4 3.1 2.6' />
    <circle cx='10.5' cy='6' r='0.9' />
  </Icon>
);

export const ControlIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x='2' y='5' width='12' height='6' rx='1.5' />
    <path d='M5 8h3' />
  </Icon>
);

export const ArrowIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M3 8h10M9 4l4 4-4 4' />
  </Icon>
);

export const PauseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M5.5 3.5v9M10.5 3.5v9' />
  </Icon>
);

export const PlayIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d='M5 3.5v9l7-4.5z' />
  </Icon>
);
