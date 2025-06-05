import React, { useState } from 'react';
import './BridePreparationPage.css'; // ייבוא קובץ העיצוב

const BridePreparationPage = () => {
  const [formData, setFormData] = useState({
    makeup: false,
    hair: false,
    breakfast: false,
    salonClean: false,
  });

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("שמירת נתונים:", formData);
    alert("הטופס נשמר בהצלחה!");
  };

  return (
    <div className="bride-prep-container">
      <h2 className="bride-prep-title">טופס התארגנות לכלה: רות כהן</h2>

      <form onSubmit={handleSubmit} className="bride-prep-form">
        <label>
          <input
            type="checkbox"
            name="makeup"
            checked={formData.makeup}
            onChange={handleChange}
          />
          מאפרת נקבעה
        </label>

        <label>
          <input
            type="checkbox"
            name="hair"
            checked={formData.hair}
            onChange={handleChange}
          />
          מעצבת שיער נקבעה
        </label>

        <label>
          <input
            type="checkbox"
            name="breakfast"
            checked={formData.breakfast}
            onChange={handleChange}
          />
          ארוחת בוקר תואמה
        </label>

        <label>
          <input
            type="checkbox"
            name="salonClean"
            checked={formData.salonClean}
            onChange={handleChange}
          />
          הסלון נקי ליום ההגעה
        </label>

        <button type="submit">שמור</button>
      </form>
    </div>
  );
};

export default BridePreparationPage;
