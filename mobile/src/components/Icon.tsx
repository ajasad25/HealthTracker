import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../theme';

export type IconName =
  | 'heart'
  | 'pulse'
  | 'drop'
  | 'thermo'
  | 'lung'
  | 'plus'
  | 'home'
  | 'list'
  | 'user'
  | 'bell'
  | 'chevron'
  | 'chevronL'
  | 'check'
  | 'alert'
  | 'sparkle'
  | 'eye'
  | 'eyeOff'
  | 'face'
  | 'filter'
  | 'cal'
  | 'dot'
  | 'arrow'
  | 'moon'
  | 'logout';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  stroke?: number;
}

/**
 * Stroke icon set ported 1:1 from the design handoff (icons.jsx).
 * 24px viewBox, 1.6px default stroke, round caps/joins.
 */
export default function Icon({
  name,
  size = 22,
  color = colors.ink,
  stroke = 1.6,
}: Props) {
  const p = {
    fill: 'none',
    stroke: color,
    strokeWidth: stroke,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const svg = (children: React.ReactNode) => (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {children}
    </Svg>
  );

  switch (name) {
    case 'heart':
      return svg(
        <Path
          {...p}
          d="M12 20.5s-7.5-4.4-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 3A10.2 10.2 0 0 1 12 20.5z"
        />
      );
    case 'pulse':
      return svg(<Path {...p} d="M2 12h4l2-6 4 12 3-9 2 3h5" />);
    case 'drop':
      return svg(<Path {...p} d="M12 3s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z" />);
    case 'thermo':
      return svg(
        <>
          <Path {...p} d="M14 14.8V4a2 2 0 1 0-4 0v10.8a4 4 0 1 0 4 0z" />
          <Path {...p} d="M12 8v8" />
        </>
      );
    case 'lung':
      return svg(
        <>
          <Path {...p} d="M12 4v9" />
          <Path {...p} d="M12 13c-1 4-3 6-5 6-2 0-3-2-3-5 0-3 2-6 4-8" />
          <Path {...p} d="M12 13c1 4 3 6 5 6 2 0 3-2 3-5 0-3-2-6-4-8" />
        </>
      );
    case 'plus':
      return svg(<Path {...p} d="M12 5v14M5 12h14" />);
    case 'home':
      return svg(
        <Path {...p} d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z" />
      );
    case 'list':
      return svg(<Path {...p} d="M4 6h16M4 12h16M4 18h10" />);
    case 'user':
      return svg(
        <>
          <Circle {...p} cx={12} cy={8} r={4} />
          <Path {...p} d="M4 21c0-4 4-7 8-7s8 3 8 7" />
        </>
      );
    case 'bell':
      return svg(
        <>
          <Path {...p} d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z" />
          <Path {...p} d="M10 19a2 2 0 0 0 4 0" />
        </>
      );
    case 'chevron':
      return svg(<Path {...p} d="M9 6l6 6-6 6" />);
    case 'chevronL':
      return svg(<Path {...p} d="M15 6l-6 6 6 6" />);
    case 'check':
      return svg(<Path {...p} d="M5 12l5 5L20 7" />);
    case 'alert':
      return svg(
        <>
          <Path {...p} d="M12 3l10 18H2L12 3z" />
          <Path {...p} d="M12 10v5M12 18v.01" />
        </>
      );
    case 'sparkle':
      return svg(<Path {...p} d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />);
    case 'eye':
      return svg(
        <>
          <Path {...p} d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
          <Circle {...p} cx={12} cy={12} r={3} />
        </>
      );
    case 'eyeOff':
      return svg(
        <Path
          {...p}
          d="M3 3l18 18M10 6a10 10 0 0 1 12 6 9 9 0 0 1-3 4M6 8c-2 2-4 4-4 4s4 7 10 7c2 0 4-.6 5-1"
        />
      );
    case 'face':
      return svg(
        <>
          <Rect {...p} x={3} y={3} width={18} height={18} rx={4} />
          <Path {...p} d="M8 9v1M16 9v1M8 14c1.5 1.5 6.5 1.5 8 0" />
        </>
      );
    case 'filter':
      return svg(<Path {...p} d="M3 5h18l-7 9v6l-4-2v-4L3 5z" />);
    case 'cal':
      return svg(
        <>
          <Rect {...p} x={3} y={5} width={18} height={16} rx={2} />
          <Path {...p} d="M3 9h18M8 3v4M16 3v4" />
        </>
      );
    case 'dot':
      return svg(<Circle cx={12} cy={12} r={4} fill={color} />);
    case 'arrow':
      return svg(<Path {...p} d="M5 12h14M13 6l6 6-6 6" />);
    case 'moon':
      return svg(<Path {...p} d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z" />);
    case 'logout':
      return svg(
        <>
          <Path {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Path {...p} d="M16 17l5-5-5-5M21 12H9" />
        </>
      );
    default:
      return null;
  }
}
