import React, { useState } from "react";
import "./aiSummarise.css";

const aiSummariseSec = ({ questionId, summMockUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sumTxt, setSumTxt] = useState("");
  const [loading, setLoading] = useState(false);
  const [alrdyFetch, setAlrdyFetch] = useState(false);

  const toggleOpen = async () => {
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState && !alrdyFetch) {
      loadSummary();
    }
  };

  const loadSummary = async () => {
    setLoading(true);

    const url = summMockUrl || `http://localhost:5001/api/questions/${questionId}/summary`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      setSumTxt(data.summary || data.content || "No summary available.");
    } else {
      setSumTxt("Temporary summary: Some answers focus on different approaches; comments add clarifications.");
    }

    setAlrdyFetch(true);
    setLoading(false);
  };

  return (
    <div className="ai-sum-container">
      <div className="ai-sum-header" onClick={toggleOpen}>
        <span className="ai-sum-arrow">{isOpen ? "▲" : "▼"}</span>
        <span className="ai-sum-title">
          {isOpen ? "Hide Summary" : "Show AI Summary"}
        </span>
      </div>

      {isOpen && (
        <div className="ai-sum-content">
          {loading ? (
            <div className="ai-sum-loading">
              <span className="ai-sum-spinner">...</span>
              <span>Loading summary...</span>
            </div>
          ) : (
            <div className="ai-sum-text">{sumTxt}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default aiSummariseSec;
