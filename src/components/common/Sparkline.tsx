interface SparklineProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  showTrend?: boolean;
}

export function Sparkline({ data, color, width = 60, height = 24, showTrend = true }: SparklineProps) {
  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showTrend && (
        <>
          <circle
            cx={width}
            cy={height - ((data[data.length - 1] - min) / range) * height}
            r="2"
            fill={color}
          />
          <circle
            cx="0"
            cy={height - ((data[0] - min) / range) * height}
            r="2"
            fill={color}
          />
        </>
      )}
    </svg>
  );
}
