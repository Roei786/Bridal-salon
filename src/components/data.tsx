// src/pages/WeddingsStatsPage.tsx - גרסה עם בורר שנה מעוצב

import React, { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, type ChartOptions
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import GenericPieChart from '@/components/GenericPieChart';
import { Loader2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const months = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

const dummyWeddingsData = [12, 18, 25, 30, 28, 35, 40, 38, 22, 20, 15, 10];

const WeddingsStatsPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  const [weddingsByMonth, setWeddingsByMonth] = useState<number[]>([]);
  const [paymentStatusCounts, setPaymentStatusCounts] = useState<{ paid: number; notPaid: number } | null>(null);
  const [appointmentTypeCounts, setAppointmentTypeCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const yearToFetch = parseInt(selectedYear, 10);
        const bridesCollectionRef = collection(db, 'Brides');
        const appointmentsCollectionRef = collection(db, 'Appointments');

        const [bridesSnapshot, appointmentsSnapshot] = await Promise.all([
          getDocs(bridesCollectionRef),
          getDocs(appointmentsCollectionRef),
        ]);

        const monthlyCounts = Array(12).fill(0);
        const payments = { paid: 0, notPaid: 0 };
        bridesSnapshot.forEach(doc => {
          const data = doc.data();
          const date: Timestamp = data.weddingDate;
          if (date && date.toDate().getFullYear() === yearToFetch) {
            const month = date.toDate().getMonth();
            monthlyCounts[month]++;
          }
          if (data.paymentStatus === true) {
            payments.paid++;
          } else {
            payments.notPaid++;
          }
        });
        setWeddingsByMonth(monthlyCounts);
        setPaymentStatusCounts(payments);

        const appointmentTypes: Record<string, number> = {};
        appointmentsSnapshot.forEach(doc => {
          const type = doc.data().type;
          if (type) {
            appointmentTypes[type] = (appointmentTypes[type] || 0) + 1;
          }
        });
        setAppointmentTypeCounts(appointmentTypes);

      } catch (error) {
        console.error('שגיאה בשליפת נתונים:', error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear !== '2024') {
        fetchAllData();
    } else {
        setWeddingsByMonth(dummyWeddingsData);
        setPaymentStatusCounts({ paid: 150, notPaid: 30 });
        setAppointmentTypeCounts({ 'פגישת ייעוץ': 100, 'מדידה ראשונה': 80, 'תיקונים': 50 });
        setLoading(false);
    }
  }, [selectedYear]);

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { font: { size: 16, weight: 'bold' } },
      },
      title: {
        display: true,
        text:`מספר חתונות לפי חודש בשנת ${selectedYear}`,
        font: { size: 24, weight: 'bold' },
      },
      datalabels: {
        display: true,
        color: '#3f3f46',
        anchor: 'end',
        align: 'top',
        font: {
          size: 14,
          weight: 'bold',
        },
        formatter: (value) => {
          return value > 0 ? value : '';
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'כמות חתונות',
          font: { size: 16, weight: 'bold' },
        },
        ticks: { font: { size: 14 } },
      },
      x: {
        title: {
          display: true,
          text: 'חודשי השנה',
          font: { size: 16, weight: 'bold' },
        },
        ticks: { font: { size: 14 } },
      },
    },
  };

  const barChartData = {
    labels: months,
    datasets: [{
      label: 'מספר חתונות',
      data: weddingsByMonth,
      backgroundColor: '#fcd34d',
      borderColor: '#f59e0b',
      borderRadius: 5,
      borderWidth: 2,
    }],
  };
  
  const paymentChartData = useMemo(() => {
    if (!paymentStatusCounts) return null;
    return {
      labels: ['שילמו', 'לא שילמו'],
      datasets: [{
        data: [paymentStatusCounts.paid, paymentStatusCounts.notPaid],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: ['#047857', '#b91c1c'],
        borderWidth: 1,
      }],
    };
  }, [paymentStatusCounts]);

  const appointmentChartData = useMemo(() => {
    if (!appointmentTypeCounts) return null;
    return {
      labels: Object.keys(appointmentTypeCounts),
      datasets: [{
        data: Object.values(appointmentTypeCounts),
        backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#14b8a6'],
        borderColor: ['#1d4ed8', '#5b21b6', '#be185d', '#c2410c', '#0d9488'],
        borderWidth: 1,
      }],
    };
  }, [appointmentTypeCounts]);

  return (
    <div className="p-6 md:p-8">
      {/* --- שינוי 1: כותרת ממורכזת וגדולה יותר --- */}
      <h1 className="text-center text-4xl font-black text-amber-800 mb-4">סטטיסטיקות ונתונים</h1>

      {/* --- שינוי 2: הוספת אזור בחירת שנה ממורכז ומודגש --- */}
      <div className="flex justify-center my-8">
        <div className="inline-flex items-center gap-4 bg-white p-4 rounded-xl shadow-lg border">
            <label className="text-lg font-semibold text-gray-800">הצג נתונים עבור שנת:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border-2 border-amber-400 rounded-lg px-4 py-2 text-lg font-bold text-amber-900 bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="2025">2025</option>
              <option value="2024">2024 (דמה)</option>
            </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto"/>
            <p className="text-center text-gray-500 text-lg mt-4">טוען נתונים...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-lg h-[500px] w-full" dir="rtl">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {paymentChartData && (
              <GenericPieChart chartData={paymentChartData} title="התפלגות תשלומים" />
            )}
            {appointmentChartData && (
              <GenericPieChart chartData={appointmentChartData} title="התפלגות סוגי פגישות" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeddingsStatsPage;