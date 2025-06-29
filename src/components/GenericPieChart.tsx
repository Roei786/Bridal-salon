// src/components/GenericPieChart.tsx

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, type ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface PieChartProps {
  chartData: any;
  title: string;
}

const GenericPieChart: React.FC<PieChartProps> = ({ chartData, title }) => {
    // הוספנו בדיקה כאן כדי למנוע שגיאות אם אין נתונים
    if (!chartData) {
        return null; 
    }

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          // --- התיקון כאן ---
          font: {
            size: 16, // הגדלנו את הפונט
            weight: 'bold', // הדגשנו את הפונט
          },
          padding: 20, // הוספת ריווח מתחת למקרא
        },
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 22,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20,
        }
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md h-[400px]">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default GenericPieChart;