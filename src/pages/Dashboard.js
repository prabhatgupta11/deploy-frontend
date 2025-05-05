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
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Fetching snippets from:', `${API_URL}/api/snippets`);
      const response = await axios.get(`${API_URL}/api/snippets`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const sortedSnippets = response.data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );

      setSnippets(sortedSnippets);
      setLoading(false);

      // Extract unique tags and languages
      const tags = new Set();
      const languages = new Set();
      sortedSnippets.forEach(snippet => {
        if (snippet.tags && Array.isArray(snippet.tags)) {
          snippet.tags.forEach(tag => tags.add(tag));
        }
        if (snippet.language) {
          languages.add(snippet.language);
        }
      });

      setAvailableTags(Array.from(tags));
      setAvailableLanguages(Array.from(languages));
    } catch (err) {
      console.error('Error fetching snippets:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch snippets');
      setLoading(false);
    }
  };

  const handleBookmark = async (snippetId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to bookmark snippets');
        return;
      }

      // Find the current snippet to get its bookmark status
      const currentSnippet = snippets.find(s => s._id === snippetId);
      if (!currentSnippet) {
        toast.error('Snippet not found');
        return;
      }

      console.log('Attempting to bookmark snippet:', snippetId, 'Current status:', currentSnippet.isBookmarked);
      
      const response = await axios.patch(
        `${API_URL}/api/snippets/${snippetId}/bookmark`,
        { isBookmarked: !currentSnippet.isBookmarked }, // Send the new bookmark status
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Bookmark response:', response.data);
      
      if (response.data) {
        // Update the snippets array with the new bookmark status
        setSnippets(prevSnippets => 
          prevSnippets.map(snippet => 
            snippet._id === snippetId ? { ...snippet, isBookmarked: response.data.isBookmarked } : snippet
          )
        );
        toast.success(response.data.isBookmarked ? 'Snippet bookmarked' : 'Bookmark removed');
      } else {
        throw new Error('No response data received');
      }
    } catch (err) {
      console.error('Failed to update bookmark:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 404) {
        toast.error('Snippet not found or you do not have permission to bookmark it');
      } else if (err.response?.status === 401) {
        toast.error('Please log in again to continue');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update bookmark');
      }
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
          <div className="empty-state-content">
            <div className="empty-state-icon-wrapper">
              <FaCode className="empty-state-icon" />
            </div>
            <h2 className="empty-state-title">Welcome to Your Code Snippets Dashboard!</h2>
            <p className="empty-state-description">
              You haven't created any code snippets yet. Start organizing your code by creating your first snippet.
            </p>
            <div className="empty-state-features">
              <div className="feature">
                <FaBookmark className="feature-icon" />
                <span>Bookmark your favorite snippets</span>
              </div>
              <div className="feature">
                <FaStar className="feature-icon" />
                <span>Star important code</span>
              </div>
              <div className="feature">
                <FaCode className="feature-icon" />
                <span>Organize by language and tags</span>
              </div>
            </div>
            <Link to="/new-snippet" className="new-snippet-btn empty-state-btn">
              <FaPlus /> Create Your First Snippet
            </Link>
          </div>
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