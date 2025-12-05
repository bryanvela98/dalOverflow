import React, { useState } from "react";
import apiFetch from "../../utils/api";
import "./aiSummarise.css";
import API_BASE_URL from "../../constants/apiConfig";

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

    const url =
      summMockUrl || `${API_BASE_URL}/questions/${questionId}/summary`;
    const res = await apiFetch(url);

      const url = summMockUrl || `${API_BASE_URL}/api/ai/summarize`;
      const res = await apiFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: ansMultibody })
      });

      if (res.ok) {
        const data = await res.json();
        setSumTxt(data.summary || "Nothing but cobwebs here");
      } else {
        setSumTxt("Can't summarise, try later pls, thanks");
      }
    } catch (err) {
      console.error("Error", err);
      setSumTxt("Sorry there's something wrong, can't get the summary. Pls try again later");
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
