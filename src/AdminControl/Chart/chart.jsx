import React from 'react';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie,
  RadarChart, Radar,
  XAxis, YAxis,
  Tooltip, CartesianGrid,
  Cell, Legend,
  PolarGrid, PolarAngleAxis,
} from 'recharts';

/**
 * CẤU HÌNH MÀU SẮC ĐẬM (Dùng chung)
 */
const CHART_COLORS = {
  primary: "#2d5a2d",
  secondary: "#4ea84e",
  text: "#0f172a", // Slate 900
  grid: "#f1f5f9",
  pie: ['#2d5a2d', '#4ea84e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
};

/**
 * 1. BIỂU ĐỒ VÙNG (AREA CHART) - THEO DÕI TĂNG TRƯỞNG
 * Props: data, xKey, dataKey, color
 */
export const KLAreaChart = ({ data, xKey, dataKey, color = CHART_COLORS.primary }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.4} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey={xKey}
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.text, fontSize: 12, fontWeight: 900 }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 12, fontWeight: 900 }} />
        <Tooltip
          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: '900' }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={4}
          fillOpacity={1}
          fill="url(#colorGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

/**
 * 2. BIỂU ĐỒ CỘT (BAR CHART) - SO SÁNH DỮ LIỆU
 * Props: data, xKey, yKey, color
 */
export const KLBarChart = ({ data, xKey, yKey, color = CHART_COLORS.primary }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey={xKey}
          axisLine={false}
          tickLine={false}
          tick={{ fill: CHART_COLORS.text, fontSize: 12, fontWeight: 900 }}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: CHART_COLORS.text, fontSize: 12, fontWeight: 900 }} />
        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', fontWeight: '900', border: 'none' }} />
        <Bar dataKey={yKey} radius={[8, 8, 0, 0]} barSize={40}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? color : CHART_COLORS.secondary} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

/**
 * 3. BIỂU ĐỒ TRÒN (DONUT CHART) - TỶ LỆ CƠ CẤU
 * Props: data (mảng các {name, value})
 */
export const KLDonutChart = ({ data }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          innerRadius={70}
          outerRadius={100}
          paddingAngle={8}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS.pie[index % CHART_COLORS.pie.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: '12px', fontWeight: '900', border: 'none' }} />
        <Legend 
          verticalAlign="bottom" 
          align="center"
          iconType="circle" 
          wrapperStyle={{ fontWeight: '900', paddingTop: '20px', fontSize: '12px', textTransform: 'uppercase' }} 
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

/**
 * 4. BIỂU ĐỒ RADAR - ĐÁNH GIÁ KỸ NĂNG
 * Props: data (mảng các {subject, A (giá trị)})
 */
export const KLRadarChart = ({ data }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke={CHART_COLORS.grid} strokeWidth={2} />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: CHART_COLORS.text, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }} 
        />
        <Radar
          name="Kỹ năng"
          dataKey="A"
          stroke={CHART_COLORS.primary}
          fill={CHART_COLORS.primary}
          fillOpacity={0.5}
          strokeWidth={3}
        />
  
      </RadarChart> 
    </ResponsiveContainer>
  </div>
);

export const KLLineChart = ({ data, xKey, dataKey, color = CHART_COLORS.primary }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
        <XAxis 
          dataKey={xKey} 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: CHART_COLORS.text, fontSize: 12, fontWeight: 900 }} 
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: CHART_COLORS.text, fontSize: 12, fontWeight: 900 }} 
        />
        <Tooltip 
          contentStyle={{ 
            borderRadius: '16px', 
            border: 'none', 
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
            fontWeight: '900' 
          }} 
        />
        <Line 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={4} // Độ dày cực đậm
          dot={{ r: 6, fill: color, strokeWidth: 3, stroke: '#fff' }} // Các nút tròn to, rõ
          activeDot={{ r: 8, strokeWidth: 0 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);