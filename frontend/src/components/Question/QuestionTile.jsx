import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./QuestionTile.css";
import NewQuestionButton from "../NewQuestionButton.jsx";

export default function QuestionTile() {
  const [questions, setQuestions] = useState([]);
  const [sortedQuestions, setSortedQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("best");

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

  // Sort questions based on selected filter
  useEffect(() => {
    let sorted = [...questions];
    
    switch (sortBy) {
      case "newest":
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case "most-votes":
        sorted.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
        break;
      case "most-answered":
        sorted.sort((a, b) => (b.answerCount || 0) - (a.answerCount || 0));
        break;
      case "best":
      default:
        // Best = combination of votes and answers
        sorted.sort((a, b) => {
          const scoreA = (a.voteCount || 0) + (a.answerCount || 0) * 2;
          const scoreB = (b.voteCount || 0) + (b.answerCount || 0) * 2;
          return scoreB - scoreA;
        });
        break;
    }
    
    setSortedQuestions(sorted);
  }, [questions, sortBy]);

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
          <div className="sort-dropdown">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="best">Best</option>
              <option value="newest">Newest</option>
              <option value="most-votes">Most Votes</option>
              <option value="most-answered">Most Answered</option>
            </select>
          </div>
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
        {sortedQuestions.length > 0 ? (
          sortedQuestions.map((question) => (
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
