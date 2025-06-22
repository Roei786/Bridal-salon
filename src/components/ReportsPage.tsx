import React from 'react';

const reports = [
  { name: 'חוזה', file: 'חוזה.pdf' },
  { name: 'טופס מדידה', file: 'טופס מדידה.pdf' },
  { name: 'מחירון תיקונים', file: 'מחירון תיקונים.pdf' },
];

const ReportsPage = () => {
  const handlePrint = (file: string) => {
    const url = `/docs/${file}`;
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.focus();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-amber-800">הפקת דוחות</h1>
      <ul className="space-y-6">
        {reports.map((report, index) => (
          <li key={index} className="bg-white p-6 rounded shadow flex items-center justify-between hover:bg-amber-50 transition">
            <span className="text-gray-800 font-medium">{report.name}</span>
            <div className="flex gap-4">
              <a
                href={`/docs/${report.file}`}
                download
                className="bg-amber-100 text-amber-700 px-4 py-2 rounded hover:bg-amber-200 transition"
              >
                הורדה
              </a>
              <button
                onClick={() => handlePrint(report.file)}
                className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 transition"
              >
                הדפסה
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReportsPage;
