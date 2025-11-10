import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/QuestionPage.css";
import { useParams } from "react-router-dom";

export default function QuestionPage() {
  const [question, setQuestion] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:5001/api/questions/${id}`)
      .then((response) => {
        console.log(response.data);
        setQuestion(response.data.question);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="background-page">
      <div className="major-body">
        <div className="main-body">
          <div className="question-page">
            {/* <h1 className="question-header">Question</h1> */}
            {question && (
              <div className="question-container">
                <p className="author-name">{question.createdBy}</p>
                <h2 className="question-title">{question.title}</h2>
                <p className="question-description">{question.description}</p>
                <div className="question-tags">
                  <span className="tags-label"> </span>
                  {question.tags.map((tag, index) => (
                    <span key={index} className="tag-item">
                      {tag}
                    </span>
                  ))}
                  {/* <span className="tags-list">{question.tags.join(", ")}</span> */}
                </div>

                <div className="answers-section">
                  <h3 className="answers-header">
                    Answers ({question.answers.length})
                  </h3>
                  {question.answers.map((answer, index) => (
                    <div key={answer.id} className="answer-card">
                      <p className="answer-content">{answer.content}</p>
                      <div className="votes">
                        <button className="upvote">
                          <img src="/Upvote1.jpeg" alt="" className="logo" />
                        </button>
                        <p className="counter">{answer.upvotes || 0}</p>
                        <button className="downvote">
                          <img src="/Downvote1.jpeg" alt="" className="logo" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
