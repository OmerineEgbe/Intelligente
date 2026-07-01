'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'

interface TraitRadarChartProps {
  data: { trait: string; score: number }[]
}

export default function TraitRadarChart({ data }: TraitRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="trait"
          tick={{ fill: '#64748b', fontSize: 11 }}
        />
        <Radar
          name="Traits"
          dataKey="score"
          stroke="#0c1f4a"
          fill="#0c1f4a"
          fillOpacity={0.18}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
