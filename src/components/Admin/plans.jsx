import React, { useState } from "react";
import "./plans.css";

export default function Plans() {
  const [plans, setPlans] = useState([
    { id: 1, name: "Free", price: "0₫", features: ["Access basic lessons"], color: "gray" },
    { id: 2, name: "Basic", price: "99,000₫", features: ["All lessons", "Quizzes"], color: "blue" },
    { id: 3, name: "Premium", price: "199,000₫", features: ["Everything in Basic", "Vocabulary trainer", "Priority support"], color: "purple" },
  ]);

  return (
    <div className="plans-root">
      <div className="plans-header">
        <h2>💳 Plans</h2>
        <button className="btn-primary">+ Add Plan</button>
      </div>

      <div className="plans-grid">
        {plans.map((p) => (
          <div key={p.id} className={`plan-card ${p.color}`}>
            <h3 className="plan-name">{p.name}</h3>
            <p className="plan-price">{p.price}/month</p>

            <ul className="features">
              {p.features.map((f, idx) => (
                <li key={idx}>✅ {f}</li>
              ))}
            </ul>

            <div className="actions">
              <button className="btn-edit">✏️ Edit</button>
              <button
                className="btn-delete"
                onClick={() => setPlans((prev) => prev.filter((x) => x.id !== p.id))}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
