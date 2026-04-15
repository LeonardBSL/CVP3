import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const chartTheme = {
  grid: '#ddd3cd',
  axis: '#7f7169',
  red: '#c00030',
  burgundy: '#98002e',
  muted: '#b2a39a',
};

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid #d7ccc5',
  borderRadius: '16px',
  color: '#231815',
  boxShadow: '0 16px 32px rgba(35, 24, 21, 0.12)',
};

const tooltipLabelStyle = {
  color: '#62564f',
  fontWeight: 700,
};

const tooltipItemStyle = {
  color: '#231815',
};

export function TrendAreaChart({ data, dataKey = 'signal', label = 'Signal strength' }) {
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="signalGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor={chartTheme.red} stopOpacity={0.34} />
              <stop offset="95%" stopColor={chartTheme.burgundy} stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={chartTheme.grid} />
          <XAxis dataKey="period" tick={{ fill: chartTheme.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: chartTheme.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={value => [`${value}`, label]} contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
          <Area type="monotone" dataKey={dataKey} stroke={chartTheme.red} fill="url(#signalGradient)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function SectorPulseChart({ data }) {
  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid vertical={false} stroke={chartTheme.grid} />
          <XAxis dataKey="period" tick={{ fill: chartTheme.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: chartTheme.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} />
          <Bar dataKey="growth" radius={[10, 10, 0, 0]}>
            {data.map(item => (
              <Cell key={`${item.period}-growth`} fill={chartTheme.red} />
            ))}
          </Bar>
          <Bar dataKey="risk" radius={[10, 10, 0, 0]}>
            {data.map(item => (
              <Cell key={`${item.period}-risk`} fill={chartTheme.muted} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
