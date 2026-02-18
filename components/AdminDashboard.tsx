import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ParkingDataPoint } from '../types';

interface Props {
  historicalData: ParkingDataPoint[];
}

const AdminDashboard: React.FC<Props> = ({ historicalData }) => {
  // Process data for charts
  // 1. Average availability by hour
  const hourMap = new Map<string, { total: number; count: number }>();
  historicalData.forEach(d => {
    const hour = d.time.split(':')[0];
    const current = hourMap.get(hour) || { total: 0, count: 0 };
    hourMap.set(hour, { total: current.total + d.availability, count: current.count + 1 });
  });

  const lineData = Array.from(hourMap.entries())
    .map(([hour, val]) => ({ hour: `${hour}:00`, avg: Math.floor(val.total / val.count) }))
    .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

  // 2. Weather Impact Comparison
  const weatherMap = new Map<string, { total: number; count: number }>();
  historicalData.forEach(d => {
    const w = d.weather;
    const current = weatherMap.get(w) || { total: 0, count: 0 };
    weatherMap.set(w, { total: current.total + d.availability, count: current.count + 1 });
  });
  
  const barData = Array.from(weatherMap.entries()).map(([weather, val]) => ({
    name: weather,
    avgSpots: Math.floor(val.total / val.count)
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Hourly Availability Trend</h3>
        <p className="text-sm text-slate-500 mb-6">Average number of free spots throughout the day.</p>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#4f46e5', fontWeight: 600 }}
              />
              <Line type="monotone" dataKey="avg" stroke="#4f46e5" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Weather Impact</h3>
          <p className="text-sm text-slate-500 mb-4">Correlation between weather and spot availability (Paper Finding).</p>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                 <YAxis fontSize={10} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px' }} />
                 <Bar dataKey="avgSpots" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Decision Support</h3>
            <p className="text-sm text-slate-500 mb-4">Q-Learning Model Recommendations</p>
            
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-sm font-medium text-green-800">Weekday Mornings</span>
                    <span className="text-xs font-bold px-2 py-1 bg-green-200 text-green-800 rounded">Increase Rate</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <span className="text-sm font-medium text-blue-800">Rainy Weekends</span>
                    <span className="text-xs font-bold px-2 py-1 bg-blue-200 text-blue-800 rounded">Decrease Rate</span>
                </div>
            </div>
            <div className="mt-4 text-xs text-slate-400 text-center">Based on max Q-values from training</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;