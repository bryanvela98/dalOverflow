import React, { useState } from "react";
import apiFetch from "../../utils/api";
import "./aiSummarise.css";
import API_BASE_URL from "../../constants/apiConfig";

//formatting
const mdToHtml = (txt) => {
  if (!txt) {
    return "";
  }
  const str = String(txt);
  return str
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^# (.+)$/gm, "<h2>$1</h2>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/\n/g, "<br/>");
};

const aiSummariseSec = ({ ans, summMockUrl }) => {
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

    try {
      const ansMultibody = ans.map(a => ({ body: a.content }));

      const url = summMockUrl || "http://localhost:5001/api/ai/summarize";
      const res = await fetch(url, {
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
              <span className="ai-sum-spinner">---</span>
              <span>Summarised text upcoming</span>
            </div>
          ) : (
            <div
              className="ai-sum-text md-content"
              dangerouslySetInnerHTML={{ __html: mdToHtml(sumTxt) }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default aiSummariseSec;
