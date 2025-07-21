import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const BodyCompositionPieChart = ({ data }) => {
  if (!data || !data.weightKg) {
    return <div className="text-center text-gray-500 p-4">Dati di composizione non disponibili.</div>;
  }

  const { totalBodyWaterL, proteinKg, mineralsKg, bodyFatMassKg, weightKg } = data;

  const chartData = [
    { name: 'Acqua', value: parseFloat(totalBodyWaterL || 0) },
    { name: 'Proteine', value: parseFloat(proteinKg || 0) },
    { name: 'Minerali', value: parseFloat(mineralsKg || 0) },
    { name: 'Massa Grassa', value: parseFloat(bodyFatMassKg || 0) },
  ];

  const COLORS = ['#3b82f6', '#f87171', '#a8a29e', '#facc15'];

  const total = chartData.reduce((sum, entry) => sum + entry.value, 0);
  if(total === 0) {
      return <div className="text-center text-gray-500 p-4">I dati per il grafico non sono validi.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
              const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
              const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
              return (
                  <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px" fontWeight="bold">
                      {`${(percent * 100).toFixed(0)}%`}
                  </text>
              );
          }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
            contentStyle={{backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '0.5rem', fontSize: '12px'}}
            formatter={(value) => [`${Number(value).toFixed(1)} kg`, 'Valore']}
        />
        <Legend
            iconSize={10}
            wrapperStyle={{fontSize: "12px", bottom: 0}}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default BodyCompositionPieChart;