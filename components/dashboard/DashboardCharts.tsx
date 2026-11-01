'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

interface DashboardChartsProps {
  casesByStatus: Array<{ status: string; count: number }>
  casesByArea: Array<{ area: string; count: number }>
  teamWorkload: Array<{ name: string; cases: number; tasks: number }>
}

const STATUS_COLORS: Record<string, string> = {
  'Intake': '#0E7490',
  'Investigation': '#B7791F',
  'Filing': '#1F4FD8',
  'Hearing': '#7C3AED',
  'Judgment': '#12805C',
  'Appeal': '#C0362C',
  'Closed': '#6B7280',
  'On Hold': '#94A3B8',
}

const AREA_COLORS = ['#1F4FD8', '#7C3AED', '#0E7490', '#12805C', '#B7791F', '#C0362C']

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name?: string; color?: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-3 text-xs">
        <p className="font-semibold text-gray-800 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardCharts({ casesByStatus, casesByArea, teamWorkload }: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cases by Status - Pie */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Cases by Status</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={casesByStatus}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="count"
              nameKey="status"
            >
              {casesByStatus.map((entry, index) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status] || AREA_COLORS[index % AREA_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Team Workload - Bar */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Team Workload</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={teamWorkload} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#667085' }} axisLine={false} tickLine={false}
              tickFormatter={name => name.split(' ')[0]} />
            <YAxis tick={{ fontSize: 10, fill: '#667085' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="cases" name="Cases" fill="#1F4FD8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="tasks" name="Tasks" fill="#7C3AED" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cases by Practice Area - Horizontal Bar */}
      <div className="bg-card rounded-xl border border-border p-5 md:col-span-2">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Cases by Practice Area</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={casesByArea} layout="vertical" barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E3E6EC" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#667085' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="area" tick={{ fontSize: 10, fill: '#667085' }} axisLine={false} tickLine={false} width={130} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" name="Cases" radius={[0, 4, 4, 0]}>
              {casesByArea.map((_, index) => (
                <Cell key={index} fill={AREA_COLORS[index % AREA_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
