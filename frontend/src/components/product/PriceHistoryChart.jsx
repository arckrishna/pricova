import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingDown, Calendar } from 'lucide-react';

const PriceHistoryChart = ({ history = [], productName = '' }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
        <p className="text-xs text-slate-500">
          No historical price tracking points recorded yet for this product.
        </p>
      </div>
    );
  }

  // Group history items by date
  const dateMap = {};
  const platformsSet = new Set();

  history.forEach((item) => {
    const key = item.date;
    if (!dateMap[key]) {
      dateMap[key] = { date: key, rawDate: item.rawDate };
    }
    dateMap[key][item.platform] = item.price;
    platformsSet.add(item.platform);
  });

  const chartData = Object.values(dateMap).sort(
    (a, b) => new Date(a.rawDate) - new Date(b.rawDate)
  );

  const platformColors = {
    Amazon: '#ff9900',
    Flipkart: '#2874f0',
    Croma: '#00b090',
    'Reliance Digital': '#e42529',
  };

  const platforms = Array.from(platformsSet);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1.5 border border-slate-800">
          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            {label}
          </p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-300">{entry.name}:</span>
              </span>
              <span className="font-extrabold text-white">
                ₹{Number(entry.value).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Price Fluctuation History</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track how product prices have changed across verified platforms over the past 30 days
          </p>
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              iconType="circle"
            />
            {platforms.map((plat) => (
              <Line
                key={plat}
                type="monotone"
                dataKey={plat}
                name={plat}
                stroke={platformColors[plat] || '#6366f1'}
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceHistoryChart;
