import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/RightBar.css";

export default function RightBar() {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    totalAnswers: 0,
  });
  const [flipped, setFlipped] = useState({});

  const toggleFlip = (index) => {
    setFlipped((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const questionsRes = await fetch(`${API_BASE_URL}/questions`);
        const usersRes = await fetch(`${API_BASE_URL}/users`);

        if (questionsRes.ok && usersRes.ok) {
          const questionsData = await questionsRes.json();
          const usersData = await usersRes.json();

          const questions = questionsData.questions || [];
          const users = usersData.users || [];

          // Count answers from all questions
          const totalAnswers = questions.reduce(
            (sum, q) => sum + (q.answerCount || 0),
            0
          );

          setStats({
            totalQuestions: questions.length,
            totalUsers: users.length,
            totalAnswers: totalAnswers,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const displayStats = [
    { label: "Total Questions", value: stats.totalQuestions.toLocaleString() },
    { label: "Community Members", value: stats.totalUsers.toLocaleString() },
    { label: "Answers Posted", value: stats.totalAnswers.toLocaleString() },
  ];

  return (
    <div className="right-body">
      <div className="holder-tiles">
        {/* Community Tips Section - Now on Top */}
        <div className="holder" id="holder-tile1">
          <h3>Community Tips</h3>
          <div className="tips-content">
            <div className="tip-item">
              <h4>Ask Clear Questions</h4>
              <p>Provide context and details for better answers</p>
            </div>
            <div className="tip-item">
              <h4>Search Before Asking</h4>
              <p>Your question may already have an answer</p>
            </div>
            <div className="tip-item">
              <h4>Be Respectful</h4>
              <p>Treat community members with courtesy</p>
            </div>
            <div className="tip-item">
              <h4>Help Others</h4>
              <p>Share your knowledge and earn reputation</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Section - Now on Bottom */}
        <div className="holder" id="holder-tile2">
          <h3>Quick Stats</h3>
          <div className="stats-list">
            {displayStats.map((stat, index) => (
              <div
                key={index}
                className={`stat-item ${flipped[index] ? "flipped" : ""}`}
                onClick={() => toggleFlip(index)}
              >
                <div className="stat-inner">
                  <div className="stat-front">
                    <span className="stat-label">{stat.label}</span>
                  </div>
                  <div className="stat-back">
                    <span className="stat-value">{stat.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
