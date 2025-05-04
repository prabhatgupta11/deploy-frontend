import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
// import SyntaxHighlighter from 'react-syntax-highlighter';
// import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FaPlus, FaCode, FaSearch, FaChevronLeft, FaChevronRight, FaBookmark, FaStar } from 'react-icons/fa';
import { API_URL } from '../config';
// import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Typography } from '@mui/material';
import SnippetCard from '../components/SnippetCard';

function Dashboard() {
  const [snippets, setSnippets] = useState([]);
  const [filters, setFilters] = useState({
    language: '',
    selectedTags: [],
    search: '',
    showBookmarked: false,
    showStarred: false
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [snippetsPerPage] = useState(8);
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const { user } = useAuth();

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/snippets`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const sortedSnippets = response.data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setSnippets(sortedSnippets);
      setLoading(false);

      // Extract unique tags and languages
      const tags = new Set();
      const languages = new Set();
      sortedSnippets.forEach(snippet => {
        snippet.tags.forEach(tag => tags.add(tag));
        languages.add(snippet.language);
      });

      setAvailableTags(Array.from(tags));
      setAvailableLanguages(Array.from(languages));
    } catch (err) {
      setError('Failed to fetch snippets');
      setLoading(false);
    }
  };

  const handleBookmark = async (snippetId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/snippets/${snippetId}/bookmark`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnippets(snippets.map(snippet => 
        snippet._id === snippetId ? response.data : snippet
      ));
      toast.success(response.data.isBookmarked ? 'Snippet bookmarked' : 'Bookmark removed');
    } catch (err) {
      console.error('Failed to update bookmark:', err);
    }
  };

  const handleStar = async (snippetId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/api/snippets/${snippetId}/star`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSnippets(snippets.map(snippet => 
        snippet._id === snippetId ? response.data : snippet
      ));
      toast.success(response.data.isStarred ? 'Snippet starred' : 'Star removed');
    } catch (err) {
      console.error('Failed to update star:', err);
    }
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesLanguage = filters.language ? snippet.language === filters.language : true;
    const matchesTags = filters.selectedTags.length > 0
      ? filters.selectedTags.some(tag => snippet.tags.includes(tag))
      : true;
    const matchesSearch = filters.search
      ? snippet.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        snippet.code.toLowerCase().includes(filters.search.toLowerCase()) ||
        snippet.description.toLowerCase().includes(filters.search.toLowerCase())
      : true;
    const matchesBookmarked = filters.showBookmarked ? snippet.isBookmarked : true;
    const matchesStarred = filters.showStarred ? snippet.isStarred : true;

    return matchesLanguage && matchesTags && matchesSearch && matchesBookmarked && matchesStarred;
  });

  // Pagination logic
  const indexOfLastSnippet = currentPage * snippetsPerPage;
  const indexOfFirstSnippet = indexOfLastSnippet - snippetsPerPage;
  const currentSnippets = filteredSnippets.slice(indexOfFirstSnippet, indexOfLastSnippet);
  const totalPages = Math.ceil(filteredSnippets.length / snippetsPerPage);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          My Code Snippets
          <span>Manage and organize your code snippets</span>
        </h1>
      </div>

      <div className="search-filters-container">
        <div className="search-section">
          <input
            type="text"
            className="search-input"
            placeholder="Search snippets..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <FaSearch className="search-icon" />
        </div>

        <Link to="/new-snippet" className="new-snippet-btn">
          <FaPlus /> New Snippet
        </Link>
      </div>

      <div className="filters-row">
        <div className="filter-section">
          <h3>Language</h3>
          <select
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
          >
            <option value="">All Languages</option>
            {availableLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-section">
          <h3>Tags</h3>
          <select
            value={filters.selectedTags}
            onChange={(e) => {
              const options = e.target.options;
              const selectedValues = [];
              for (let i = 0; i < options.length; i++) {
                if (options[i].selected) {
                  selectedValues.push(options[i].value);
                }
              }
              setFilters({ ...filters, selectedTags: selectedValues });
            }}
            multiple
            size="1"
          >
            <option value="" disabled>Select tags...</option>
            {availableTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <div className="selected-tags">
            {filters.selectedTags.map((tag) => (
              <span 
                key={tag} 
                className="selected-tag"
                onClick={() => {
                  setFilters({
                    ...filters,
                    selectedTags: filters.selectedTags.filter(t => t !== tag)
                  });
                }}
              >
                {tag}
                <span className="remove-tag">×</span>
              </span>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <h3>Sort By</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        <div className="filter-section">
          <h3>Quick Filters</h3>
          <div className="quick-filters">
            <button
              className={`quick-filter-btn ${filters.showBookmarked ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, showBookmarked: !filters.showBookmarked })}
            >
              <FaBookmark /> Bookmarked
            </button>
            <button
              className={`quick-filter-btn ${filters.showStarred ? 'active' : ''}`}
              onClick={() => setFilters({ ...filters, showStarred: !filters.showStarred })}
            >
              <FaStar /> Starred
            </button>
          </div>
        </div>
      </div>

      <div className="snippets-grid">
        {currentSnippets.map((snippet) => (
          <SnippetCard 
            key={snippet._id}
            snippet={snippet}
            onBookmark={handleBookmark}
            onStar={handleStar}
          />
        ))}
      </div>

      {filteredSnippets.length === 0 ? (
        <div className="empty-state">
          <FaCode className="empty-state-icon" />
          <h2 className="empty-state-title">No Snippets Found</h2>
          <p className="empty-state-description">
            Create your first code snippet to get started
          </p>
          <Link to="/new-snippet" className="new-snippet-btn">
            <FaPlus /> Create New Snippet
          </Link>
        </div>
      ) : (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FaChevronLeft /> Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;