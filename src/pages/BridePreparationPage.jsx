import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 🔄 ניווט
import './BridePreparationPage.css'; // 🎨 עיצוב

const BridePreparationPage = () => {
  const navigate = useNavigate(); // ⬅️ הגדרת ניווט

  const [formData, setFormData] = useState({
    makeupSet: false,
    makeupName: '',
    hairSet: false,
    hairName: '',
    breakfast: false,
    salonClean: false,
  });

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // כאן תוכל לשלב שמירה ל-Firestore
    console.log("📝 נתונים שנשלחו:", formData);
    alert("הטופס נשמר בהצלחה!");
  };

  return (
    <div className="bride-prep-container">
      <h2 className="bride-prep-title">טופס התארגנות לכלה: רות כהן</h2>

      <form onSubmit={handleSubmit} className="bride-prep-form">
        {/* מאפרת */}
        <div className="bride-prep-section">
          <label>
            <input
              type="checkbox"
              name="makeupSet"
              checked={formData.makeupSet}
              onChange={handleChange}
            />
            מאפרת נקבעה
          </label>
          {formData.makeupSet && (
            <input
              type="text"
              name="makeupName"
              value={formData.makeupName}
              onChange={handleChange}
              placeholder="שם המאפרת"
              className="bride-prep-input"
            />
          )}
        </div>

        {/* מעצבת שיער */}
        <div className="bride-prep-section">
          <label>
            <input
              type="checkbox"
              name="hairSet"
              checked={formData.hairSet}
              onChange={handleChange}
            />
            מעצבת שיער נקבעה
          </label>
          {formData.hairSet && (
            <input
              type="text"
              name="hairName"
              value={formData.hairName}
              onChange={handleChange}
              placeholder="שם מעצבת השיער"
              className="bride-prep-input"
            />
          )}
        </div>

        {/* ארוחת בוקר */}
        <div className="bride-prep-section">
          <label>
            <input
              type="checkbox"
              name="breakfast"
              checked={formData.breakfast}
              onChange={handleChange}
            />
            ארוחת בוקר תואמה
          </label>
        </div>

        {/* סלון נקי */}
        <div className="bride-prep-section">
          <label>
            <input
              type="checkbox"
              name="salonClean"
              checked={formData.salonClean}
              onChange={handleChange}
            />
            הסלון נקי ליום ההגעה
          </label>
        </div>

        {/* כפתורי שליחה וחזרה */}
        <button type="submit">שמור</button>
        <button
          type="button"
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          חזרה לדשבורד
        </button>
      </form>
    </div>
  );
};

export default BridePreparationPage;
