import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../theme';

interface Props {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

/** Small inline trend chart — ported from atoms.jsx Sparkline. */
export default function Sparkline({
  data,
  color = colors.teal,
  width = 76,
  height = 26,
  fill = true,
}: Props) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const rng = Math.max(0.001, max - min);
  const pad = 2;
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (v - min) / rng) * (height - pad * 2);
    return [x, y] as const;
  });
  const path = pts
    .map((pt, i) => `${i ? 'L' : 'M'} ${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`)
    .join(' ');
  const last = pts[pts.length - 1];
  const fillPath = `${path} L ${last[0]} ${height} L ${pts[0][0]} ${height} Z`;

  return (
    <Svg width={width} height={height}>
      {fill && <Path d={fillPath} fill={color} opacity={0.1} />}
      <Path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={last[0]} cy={last[1]} r={2.2} fill={color} />
    </Svg>
  );
}
