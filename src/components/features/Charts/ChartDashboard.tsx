// 图表仪表板组件
// 作为应届生，我会创建一个展示多个图表的仪表板

'use client'

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { BudgetData, TimeData } from '@/types'

interface ChartDashboardProps {
  budgetData: BudgetData
  timeData: TimeData
}

export function ChartDashboard({ budgetData, timeData }: ChartDashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 预算分析饼图 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">预算分析</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={budgetData.categories}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {budgetData.categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`¥${value}`, '金额']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 时间分配柱状图 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">时间分配</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeData.categories}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}小时`, '时间']} />
            <Legend />
            <Bar dataKey="hours" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}