import React from "react";
import apiFetch from "../../utils/api";
import API_BASE_URL from "../../constants/apiConfig";
import TagsPage from "./TagsPage";

const Tags = () => {
  const handleFetchTags = async (params) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append("search", params.search);
      if (params.sort) queryParams.append("sort", params.sort);

      // Call Flask API
      const response = await apiFetch(`${API_BASE_URL}/tags?${queryParams}`);
      const data = await response.json();

      return {
        tags: data.tags || [],
        total: data.total || 0,
      };
    } catch (error) {
      return { tags: [], total: 0 };
    }
  };

  const handleTagClick = (tagId) => {
    window.location.href = `/questions?tag=${tagId}`;
  };

  return <TagsPage onFetchTags={handleFetchTags} onTagClick={handleTagClick} />;
};

export default Tags;
