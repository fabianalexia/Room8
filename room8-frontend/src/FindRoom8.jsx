// src/FindRoom8.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, saveSurvey } from "./api";

// reuse your existing CSS classes
import "./css/style.css";
import "./css/forms.css";
import "./css/purpose.css";

export default function FindRoom8() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [form, setForm] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
    question6: "",
    question10: "", // optional
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // exclude q10 from required fields without tripping ESLint
  const allRequiredFilled = useMemo(() => {
    const { question10: _omit, ...required } = form;
    return Object.values(required).every(Boolean);
  }, [form]);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!allRequiredFilled || loading) return;

    setLoading(true);
    try {
      await saveSurvey(user?.id, form);
      setSubmitted(true);
      setTimeout(() => navigate("/app"), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const Select = ({ name, value, onChange, required, children }) => (
    <div className="custom-select">
      <select
        id={name}
        name={name}
        required={required}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      >
        {children}
      </select>
      <span className="select-arrow">▼</span>
    </div>
  );

  if (submitted) {
    return (
      <section className="form-section">
        <div className="form-success visible" id="form-success">
          <div className="success-icon">✓</div>
          <h3>Exciting news!</h3>
          <p>
            Your preferences have been submitted. We're working on finding your
            perfect Room8 match!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="form-section form-page">
      <div className="form-header">
        <h2>Find Your Perfect Room8!</h2>
        <p>
          Answer a few quick questions to help us match you with your ideal
          roommate. The more honest you are, the better your match will be!
        </p>
      </div>

      <form className="room8-form" onSubmit={onSubmit}>
        {/* Living Preferences */}
        <div className="form-divider">
          <h3>Living Preferences</h3>
        </div>

        <div className="form-group">
          <label htmlFor="question1">What type of living space do you prefer?</label>
          <Select name="question1" required value={form.question1} onChange={update}>
            <option value="">Select an option</option>
            <option value="studio">Studio Apartment</option>
            <option value="1_bed">1 Bedroom</option>
            <option value="2_bed">2+ Bedrooms</option>
            <option value="shared_house">Shared House</option>
          </Select>
        </div>

        <div className="form-group">
          <label htmlFor="question2">How often do you clean or tidy up?</label>
          <Select name="question2" required value={form.question2} onChange={update}>
            <option value="">Select an option</option>
            <option value="daily">Daily</option>
            <option value="few_times">A few times a week</option>
            <option value="weekly">Weekly</option>
            <option value="rarely">Rarely</option>
          </Select>
        </div>

        {/* Social Dynamics */}
        <div className="form-divider">
          <h3>Social Dynamics</h3>
        </div>

        <div className="form-group">
          <label htmlFor="question5">How important is social interaction at home?</label>
          <Select name="question5" required value={form.question5} onChange={update}>
            <option value="">Select an option</option>
            <option value="very_important">Very Important</option>
            <option value="somewhat">Somewhat Important</option>
            <option value="not_important">Not Important</option>
          </Select>
        </div>

        <div className="form-group">
          <label htmlFor="question6">What is your preference for noise and quiet time?</label>
          <Select name="question6" required value={form.question6} onChange={update}>
            <option value="">Select an option</option>
            <option value="quiet">Quiet</option>
            <option value="moderate">Moderate</option>
            <option value="lively">Lively</option>
          </Select>
        </div>

        {/* Practical Matters */}
        <div className="form-divider">
          <h3>Practical Matters</h3>
        </div>

        <div className="form-group">
          <label htmlFor="question3">How would you prefer to manage household expenses?</label>
          <Select name="question3" required value={form.question3} onChange={update}>
            <option value="">Select an option</option>
            <option value="split">Split evenly</option>
            <option value="income_based">Based on income</option>
            <option value="mixed">Mixed approach</option>
          </Select>
        </div>

        <div className="form-group">
          <label htmlFor="question4">Do you have any dietary preferences or restrictions?</label>
          <Select name="question4" required value={form.question4} onChange={update}>
            <option value="">Select an option</option>
            <option value="none">None</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="gluten_free">Gluten-Free</option>
            <option value="other">Other</option>
          </Select>
        </div>

        {/* Additional Info */}
        <div className="form-divider">
          <h3>Additional Information</h3>
        </div>

        <div className="form-group-full">
          <label htmlFor="question10">Anything else we need to know?</label>
          <textarea
            id="question10"
            name="question10"
            rows={3}
            placeholder="Share your sleep schedule, pet preferences, hobbies, or anything else…"
            value={form.question10}
            onChange={(e) => update("question10", e.target.value)}
          />
        </div>

        <button
          type="submit"
          className={`submit-btn${loading ? " loading" : ""}`}
          disabled={loading || !allRequiredFilled}
        >
          <span className="btn-text">{loading ? "Submitting…" : "Find My Room8"}</span>
          <span className="btn-loading" />
        </button>
      </form>
    </section>
  );
}