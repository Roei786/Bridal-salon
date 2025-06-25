import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase-config'; // ודא שזה הנתיב הנכון

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const SeamstressPieChart = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeamstressData = async () => {
      const counts: Record<string, number> = {};
      try {
        const snapshot = await getDocs(collection(db, 'Brides'));
        snapshot.forEach(doc => {
          const data = doc.data();
          const name = data.assignedSeamstress || 'לא משויך';
          counts[name] = (counts[name] || 0) + 1;
        });

        const labels = Object.keys(counts);
        const values = Object.values(counts);

        setChartData({
          labels,
          datasets: [
            {
              label: 'מספר כלות',
              data: values,
              backgroundColor: [
                '#fc4d4d', '#6dfc4d', '#4d99fc', '#fceb4d', '#fcb04d',
                '#aa4dfc', '#ca8a04', '#a16207', '#854d0e', '#713f12'
              ],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('שגיאה בשליפת נתוני תופרות:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeamstressData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'התפלגות כלות לפי תופרת',
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-8 max-w-md mx-auto">
      {loading ? (
        <p className="text-center text-gray-500">טוען נתונים...</p>
      ) : chartData ? (
        <Pie data={chartData} options={options} />
      ) : (
        <p className="text-center text-red-500">לא נמצאו נתונים</p>
      )}
    </div>
  );
};

export default SeamstressPieChart;
