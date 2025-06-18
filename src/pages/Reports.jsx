
import React from 'react';

const Reports = () => {
  return (
    <div style={{ direction: 'rtl', padding: '2rem' }}>
      <h1>📊 הפקת דוחות</h1>

      <section>
        <h2>חוזה השכרת שמלה</h2>
        <iframe
          src="/docs/חוזה.pdf"
          width="100%"
          height="600px"
          title="חוזה השכרת שמלה"
        />
      </section>

      <section>
        <h2>טופס מדידה סופי</h2>
        <iframe
          src="/docs/טופס מדידה.pdf"
          width="100%"
          height="600px"
          title="טופס מדידה סופי"
        />
      </section>

      <section>
        <h2>מחירון תיקונים</h2>
        <iframe
          src="/docs/מחירון תיקונים.pdf"
          width="100%"
          height="600px"
          title="מחירון תיקונים"
        />
      </section>
    </div>
  );
};

export default Reports;
