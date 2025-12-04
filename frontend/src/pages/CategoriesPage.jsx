import React, { useState, useEffect } from "react";
import apiFetch from "../utils/api";
import { Link } from "react-router-dom";
import Header from "../components/Header/Header";
import Sidebar from "../components/Sidebar";
import RightBar from "../components/RightBar";
import API_BASE_URL from "../constants/apiConfig";
import "../styles/CategoriesPage.css";

export default function CategoriesPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await apiFetch(`${API_BASE_URL}/tags`);
        const data = await response.json();
        if (data.tags) {
          setTags(data.tags);
        }
      } catch (err) {
        setError("Failed to load categories");
        console.error("Error fetching tags:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  const filteredTags = tags.filter((tag) =>
    tag.tag_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="background-page">
      <Header />
      <div className="major-body">
        <Sidebar />
        <div className="main-body">
          <div className="centre-body">
            <div className="categories-header">
              <h1>Categories</h1>
              <p>
                Browse all available categories and find questions in your areas
                of interest
              </p>
            </div>

            <div className="categories-search">
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="categories-search-input"
              />
            </div>

            {loading && (
              <p className="loading-message">Loading categories...</p>
            )}
            {error && <p className="error-message">{error}</p>}

            {!loading && !error && (
              <div className="categories-grid">
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/tags/${tag.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div className="category-card">
                        <h3 className="category-name">{tag.tag_name}</h3>
                        <p className="category-description">
                          {tag.description || "Explore this category"}
                        </p>
                        <div className="category-meta">
                          <span className="category-count">
                            {tag.question_count || 0} questions
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="no-results">
                    No categories found matching your search
                  </p>
                )}
              </div>
            )}
          </div>
          <RightBar />
        </div>
      </div>
    </div>
  );
}
