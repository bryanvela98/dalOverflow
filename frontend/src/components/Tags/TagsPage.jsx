import React, { useState, useEffect } from 'react';
import './TagsPage.css';


/**
 * Tags Page Component (Issue #3)
 * Pure JavaScript version
 */
const TagsPage = ({
  onFetchTags,
  onTagClick,
}) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          search: searchTerm || undefined,
          sort: showNewOnly ? 'new' : sortBy,
        };
        const result = await onFetchTags(params);
        setTags(result.tags);
        setTotal(result.total);
      } catch (error) {
        console.error('Failed to fetch tags:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, sortBy, showNewOnly, onFetchTags]);

  return (
    <div className="tags-page">
      <div className="tags-container">
        <header className="tags-header">
          <h1>Tags</h1>
          <p className="tags-subtitle">
            A tag is a keyword or label that categorizes your question with other similar questions.
          </p>
        </header>

        <div className="tags-filters">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Filter by tag name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sort-buttons">
            <button
              className={`sort-button ${sortBy === 'popular' && !showNewOnly ? 'sort-button--active' : ''}`}
              onClick={() => { setSortBy('popular'); setShowNewOnly(false); }}
            >
              Popular
            </button>
            <button
              className={`sort-button ${sortBy === 'name' && !showNewOnly ? 'sort-button--active' : ''}`}
              onClick={() => { setSortBy('name'); setShowNewOnly(false); }}
            >
              Name
            </button>
            <button
              className={`sort-button ${showNewOnly ? 'sort-button--active' : ''}`}
              onClick={() => setShowNewOnly(!showNewOnly)}
            >
              New
            </button>
          </div>
        </div>

        <div className="results-info">
          {total.toLocaleString()} {total === 1 ? 'tag' : 'tags'}
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading tags...</p>
          </div>
        ) : (
          <div className="tags-grid">
            {tags.map((tag) => (
              <div key={tag.id} className="tag-card" onClick={() => onTagClick(tag.id)}>
                {tag.isNew && <span className="tag-new-badge">New</span>}
                <h3 className="tag-name">{tag.name}</h3>
                <p className="tag-description">{tag.description}</p>
                <div className="tag-stats">
                  <div className="tag-stat">
                    <span className="stat-value">{tag.totalQuestions.toLocaleString()}</span>
                    <span className="stat-label">questions</span>
                  </div>
                  <div className="tag-activity">
                    <span>{tag.askedToday} asked today</span>
                    <span>•</span>
                    <span>{tag.askedThisWeek} this week</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagsPage;

