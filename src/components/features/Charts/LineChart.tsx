'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// 组件属性类型
interface LineChartProps {
  data: any[] // 图表数据
  xKey: string // X轴数据键
  yKey: string // Y轴数据键
  width?: number // 图表宽度
  height?: number // 图表高度
  color?: string // 线条颜色
  showGrid?: boolean // 是否显示网格
  showTooltip?: boolean // 是否显示提示框
  showLegend?: boolean // 是否显示图例
  className?: string // CSS类名
}

// 折线图组件
export default function CustomLineChart({
  data,
  xKey,
  yKey,
  width,
  height = 300,
  color = '#3b82f6',
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  className = ''
}: LineChartProps) {
  // 如果没有数据，显示空状态
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-${height} ${className}`}>
        <div className="text-center">
          <div className="text-gray-400 text-4xl mb-4">📈</div>
          <p className="text-gray-500">暂无数据</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className} style={{ width: width || '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          <Line 
            type="monotone" 
            dataKey={yKey} 
            stroke={color} 
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}