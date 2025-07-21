import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

const ObesityHealthBarChart = ({ obesityData, additionalData }) => {
  if (!obesityData || !additionalData) {
    return <div className="text-center text-gray-500 p-4">Dati di obesità non disponibili.</div>;
  }

  const { bmi, percentBodyFat } = obesityData;
  const { waistHipRatio, visceralFatLevel } = additionalData;

  const data = [
    { name: 'IMC', value: bmi || 0 },
    { name: 'Grasso %', value: percentBodyFat || 0 },
    { name: 'Grasso Visc.', value: visceralFatLevel || 0 },
    { name: 'Vita/Fianchi', value: waistHipRatio || 0 },
  ].filter(item => typeof item.value === 'number');

  if (data.length === 0) {
    return <div className="text-center text-gray-500 p-4">Dati insufficienti per il grafico.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <XAxis type="number" hide />
        <YAxis 
          type="category" 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 12, fill: '#4b5563' }}
          width={80}
        />
        <Tooltip 
          cursor={{fill: 'rgba(238, 242, 255, 0.5)'}}
          contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '0.5rem', fontSize: '12px'}}
        />
        <Bar dataKey="value" barSize={20} radius={[0, 10, 10, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ObesityHealthBarChart;