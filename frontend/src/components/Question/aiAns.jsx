import React, { useState, useEffect } from "react";
import apiFetch from "../../utils/api";
import API_BASE_URL from "../../constants/apiConfig";
import "./aiAns.css";

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

//kept mock if we wanna use diff url just in case
const aiAnsSec = ({ questionTitle, questionBody, aiAnsMockUrl }) => {
  const [genState, setGenState] = useState("loading");
  const [aiTxt, setAiTxt] = useState("");

  const handleGenerate = async () => {
    setGenState("loading");

    try {
      const endpoint = aiAnsMockUrl || `${API_BASE_URL}/ai/answer`;
      const response = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: questionTitle,
          body: questionBody,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiTxt(data.answer || data.content || "No answer generated.");
      } else {
        //mock answer for unpredicatable scenarios
        setAiTxt(
          `Based on the question "${questionTitle}", here's a suggested approach: This appears to be a technical question that would benefit from checking the official documentation and testing the solution in a development environment.`
        );
      }
      setGenState("done");
    } catch (error) {
      setAiTxt(`Please try after some time`);
      setGenState("done");
    }
  };

  //display on redirect or new question
  useEffect(() => {
    const autoFetch = () => {
      handleGenerate();
    };
    autoFetch();
  }, []);

  if (genState === "loading") {
    return (
      <div className="ai-ans-container">
        <div className="ai-ans-loading">
          <span className="ai-ans-spinner">---</span>
          <span>Answer in making</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-ans-container">
      <div className="ai-ans-header">
        <span className="ai-ans-badge">Gen-AI answer</span>
      </div>
      <div
        className="ai-ans-content md-content"
        dangerouslySetInnerHTML={{ __html: mdToHtml(aiTxt) }}
      />
    </div>
  );
};

export default aiAnsSec;
