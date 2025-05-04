import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// eslint-disable-next-line no-unused-vars
import axios from 'axios';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { FaPlus, FaCopy, FaTrash, FaCode } from 'react-icons/fa';
// eslint-disable-next-line no-unused-vars
import { API_URL, CARD_COLORS } from '../config';

function Dashboard() {
  const [snippets, setSnippets] = useState([]);
  const [filters, setFilters] = useState({
    language: '',
    selectedTags: [],
    search: ''
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [snippetsPerPage] = useState(6);
  const [sortBy, setSortBy] = useState('newest');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/snippets`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Sort snippets by createdAt in descending order
      const sortedSnippets = response.data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setSnippets(sortedSnippets);

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
      toast.error('Error fetching snippets');
    }
  };

  const deleteSnippet = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/snippets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Snippet deleted successfully');
      fetchSnippets();
    } catch (err) {
      toast.error('Error deleting snippet');
    }
  };

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleTagSelect = (tag) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  const filteredSnippets = snippets.filter(snippet => {
    const matchesLanguage = filters.language ? snippet.language === filters.language : true;

    // Changed from every() to some() for OR condition between tags
    const matchesTags = filters.selectedTags.length > 0
      ? filters.selectedTags.some(tag => snippet.tags.includes(tag))  // Changed from every to some
      : true;

    const matchesSearch = filters.search
      ? snippet.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      snippet.code.toLowerCase().includes(filters.search.toLowerCase()) ||
      snippet.description.toLowerCase().includes(filters.search.toLowerCase())
      : true;

    return matchesLanguage && matchesTags && matchesSearch;
  });

  const getCardStyle = (index) => {
    const colorIndex = index % CARD_COLORS.length;
    const colors = CARD_COLORS[colorIndex];
    return {
      backgroundColor: colors.bg,
      borderColor: colors.border
    };
  };

  const sortSnippets = (snippets) => {
    switch (sortBy) {
      case 'newest':
        return [...snippets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return [...snippets].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'title':
        return [...snippets].sort((a, b) => a.title.localeCompare(b.title));
      case 'language':
        return [...snippets].sort((a, b) => a.language.localeCompare(b.language));
      default:
        return snippets;
    }
  };

  const indexOfLastSnippet = currentPage * snippetsPerPage;
  const indexOfFirstSnippet = indexOfLastSnippet - snippetsPerPage;
  const currentSnippets = sortSnippets(filteredSnippets).slice(indexOfFirstSnippet, indexOfLastSnippet);
  const totalPages = Math.ceil(filteredSnippets.length / snippetsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <div className="dashboard-header">
        <h1 className="main-title">My Code Snippets</h1>
        <div className="header-actions">
          <span className="snippet-counter">{filteredSnippets.length} snippets</span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="filters-group">
          <div className="filter-row">
            <div className="filter-column">
              <label className="filter-label">Language</label>
              <select
                value={filters.language}
                onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                className="filter-select"
              >
                <option value="">All Languages</option>
                {availableLanguages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="filter-column">
              <label className="filter-label">Tags</label>
              <select
                value=""
                onChange={(e) => handleTagSelect(e.target.value)}
                className="filter-select"
              >
                <option value="">Select Tags...</option>
                {availableTags
                  .filter(tag => !filters.selectedTags.includes(tag))
                  .map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
              </select>
              <div className="selected-tags-container">
                {filters.selectedTags.map(tag => (
                  <span key={tag} className="selected-tag">
                    {tag}
                    <button 
                      onClick={() => handleTagSelect(tag)} 
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="filter-column">
              <label className="filter-label">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title (A-Z)</option>
                <option value="language">Language (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="search-action-group">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search snippets..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="search-input"
              />
            </div>
            <button 
              className="new-snippet-button"
              onClick={() => navigate('/new-snippet')}
            >
              <FaPlus /> New Snippet
            </button>
          </div>
        </div>
      </div>

      <div className="snippets-grid">
        {currentSnippets.map((snippet, index) => (
          <div
            key={snippet._id}
            className="snippet-card"
            style={getCardStyle(index)}
          >
            <div className="snippet-header">
              <h3>{snippet.title}</h3>
              <div className="snippet-actions">
                <button
                  className="icon-btn"
                  onClick={() => copyToClipboard(snippet.code)}
                  title="Copy to clipboard"
                >
                  <FaCopy />
                </button>
                <button
                  className="icon-btn delete"
                  onClick={() => deleteSnippet(snippet._id)}
                  title="Delete snippet"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="snippet-meta">
              <span className="snippet-language">
                <FaCode /> {snippet.language}
              </span>
              <span className="snippet-date">
                {new Date(snippet.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="snippet-preview">
              <SyntaxHighlighter
                language={snippet.language}
                style={docco}
                customStyle={{ maxHeight: '200px' }}
              >
                {snippet.code}
              </SyntaxHighlighter>
            </div>

            {snippet.description && (
              <div className="snippet-description">
                {snippet.description}
              </div>
            )}

            <div className="snippet-tags">
              {snippet.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="page-button"
        >
          Previous
        </button>

        <div className="page-numbers">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`page-number ${currentPage === number ? 'active' : ''}`}
            >
              {number}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="page-button"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Dashboard;