import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts'
import { projectStatus } from '@/mocks/dashboard'

export function ProjectChart() {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={projectStatus}>
        <defs>
          <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f9b8e" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#0f9b8e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#E4E7EC" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#98A2B3" />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#98A2B3" width={28} />
        <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E4E7EC', fontSize: 12 }} />
        <Area type="monotone" dataKey="active" stroke="#0f9b8e" strokeWidth={2} fill="url(#activeGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
