import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./QuestionTile.css";
import NewQuestionButton from "../NewQuestionButton.jsx";

export default function QuestionTile() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/questions");
        const data = await response.json();
        if (data.questions) {
          setQuestions(data.questions);
        }
      } catch (err) {
        setError("Failed to load questions");
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  if (loading)
    return (
      <div className="centre-body">
        <p>Loading questions...</p>
      </div>
    );
  if (error)
    return (
      <div className="centre-body">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="centre-body">
      <div className="filter-question-div">
        <div className="filter">
          <button>
            <p>Best</p>
            <img src="/Dropdown.png" alt="" className="logo" />
          </button>
          <button>
            <p>Filter</p>
            <img src="/Filter.png" alt="" className="logo" />
          </button>
        </div>
        <div className="new-question">
          <NewQuestionButton />
        </div>
      </div>
      <div className="tiles">
        {questions.length > 0 ? (
          questions.map((question) => (
            <Link
              key={question.id}
              to={`/questions/${question.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="tile">
                <div className="tile-centre">
                  <div className="question">{question.title}</div>
                  <hr />
                  <div className="answer">
                    {question.body?.substring(0, 200) ||
                      "No description available"}
                    ...
                  </div>
                </div>
                <div className="tile-right">
                  <div className="votes">
                    <button className="upvote">
                      <img src="Upvote1.jpeg" alt="" className="logo" />
                    </button>
                    <p className="counter">{question.voteCount || 0}</p>
                    <button className="downvote">
                      <img src="/Downvote1.jpeg" alt="" className="logo" />
                    </button>
                  </div>
                  <div className="comments">
                    <img src="/MessageSquare.png" alt="" className="logo" />
                    <p className="comment-counter">
                      {question.answerCount || 0}
                    </p>
                  </div>
                  <div className="views">
                    <p>Views</p>
                    <p className="views-counter">{question.view_count || 0}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>No questions available</p>
        )}
      </div>
    </div>
  );
}
