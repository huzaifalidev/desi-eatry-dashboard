'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts'

interface BarChartCard {
  title: string
  data: any[]
  dataKey: string
  xKey: string
  fill?: string
}

interface AreaChartCard {
  title: string
  data: any[]
  dataKey: string
  xKey: string
  stroke?: string
  fill?: string
}

interface PieChartCard {
  title: string
  data: any[]
  dataKey: string
  nameKey: string
  colors?: string[]
}

interface Props {
  barCharts?: BarChartCard[]
  areaCharts?: AreaChartCard[]
  pieCharts?: PieChartCard[]
}

export function InsightsCharts({ barCharts = [], areaCharts = [], pieCharts = [] }: Props) {
  const COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4']

  // Custom tooltip for better formatting
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: Rs {Number(entry.value).toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Area Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {areaCharts.map((chart) => (
          <Card key={chart.title}>
            <CardHeader>
              <CardTitle className="text-sm">{chart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chart.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chart.stroke || '#3b82f6'} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={chart.stroke || '#3b82f6'} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey={chart.xKey}
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => `Rs ${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey={chart.dataKey}
                    stroke={chart.stroke || '#3b82f6'}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    name="Daily Sales"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {barCharts.map((chart) => (
          <Card key={chart.title}>
            <CardHeader>
              <CardTitle className="text-sm">{chart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey={chart.xKey} stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey={chart.dataKey} fill={chart.fill || '#3b82f6'} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {pieCharts.map((chart) => (
          <Card key={chart.title}>
            <CardHeader>
              <CardTitle className="text-sm">{chart.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chart.data}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey={chart.dataKey}
                    nameKey={chart.nameKey}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {chart.data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chart.colors?.[index % chart.colors.length] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rs ${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
