import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase-config'; // ודא שזה הנתיב לקובץ firebase שלך
import SeamstressPieChart from './SeamstressPieChart';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const months = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

const dummyData = [12, 18, 25, 30, 28, 35, 40, 38, 22, 20, 15, 10];

const WeddingsStatsPage = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [weddingsData, setWeddingsData] = useState<number[]>(dummyData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedYear === '2025') {
      fetchWeddingsFromFirestore();
    } else {
      setWeddingsData(dummyData);
    }
  }, [selectedYear]);

  const fetchWeddingsFromFirestore = async () => {
    setLoading(true);
    const counts = Array(12).fill(0);
    try {
      const snapshot = await getDocs(collection(db, 'Brides'));
      snapshot.forEach(doc => {
        const data = doc.data();
        const date: Timestamp = data.weddingDate;
        if (date && date.toDate().getFullYear() === 2025) {
          const month = date.toDate().getMonth(); // 0-11
          counts[month]++;
        }
      });
      setWeddingsData(counts);
    } catch (error) {
      console.error('שגיאה בשליפת נתונים מ־Firestore:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'מספר חתונות',
        data: weddingsData,
        backgroundColor: '#fbbf24',
        borderColor: '#92400e',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `חתונות לפי חודש בשנת ${selectedYear}${selectedYear === '2024' ? ' (דמה)' : ''}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-amber-800 mb-4">סטטיסטיקות ונתונים</h1>

      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mr-2">בחר שנה:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1"
        >
          <option value="2024">2024 (דמה)</option>
          <option value="2025">2025 </option>
        </select>
      </div>

      <div className="bg-white p-4 rounded shadow h-[650px] max-w-5xl mx-auto">
        {loading ? (
    <p className="text-center text-gray-500">טוען נתונים...</p>
  ) : (
    <Bar data={chartData} options={options} />
  )}
</div>
    <SeamstressPieChart />

    </div>
  );
};

export default WeddingsStatsPage;
