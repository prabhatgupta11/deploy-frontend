import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { API_URL } from '../config';

function NewSnippet() {
  const [snippet, setSnippet] = useState({
    title: '',
    code: '',
    language: 'javascript',
    tags: [],
    description: ''
  });
  const [customTagInput, setCustomTagInput] = useState('');
  const navigate = useNavigate();

  const languages = [
    'javascript',
    'python',
    'java',
    'cpp',
    'ruby',
    'php',
    'bash',
    'html',
    'css'
  ];

  const autoDetectTags = (code) => {
    const tags = new Set();
    
    // Loop detection
    if (code.match(/(for|while|do\s+while|forEach)/)) {
      tags.add('loop');
    }

    // API calls detection
    if (code.match(/(fetch|axios|XMLHttpRequest|http\.get|request\.get)/)) {
      tags.add('api');
    }

    // Error handling detection
    if (code.match(/(try:|try {|catch|except|throw|throws|Exception|Error)/)) {
      tags.add('error-handling');
    }

    // Array operations detection
    if (code.match(/\.(map|filter|reduce|forEach|some|every)/)) {
      tags.add('array-ops');
    }

    // Debugging detection
    if (code.match(/(console\.log|print|System\.out\.println)/)) {
      tags.add('debugging');
    }

    // Function detection
    if (code.match(/(function|=>|\bdef\b|\bclass\b)/)) {
      tags.add('function');
    }

    // Python specific detection
    if (code.match(/(def |class |import |from .* import)/)) {
      tags.add('python');
    }

    // React hooks detection
    if (code.match(/(useState|useEffect|useContext|useRef)/)) {
      tags.add('react-hooks');
    }

    // Database operations
    if (code.match(/(SELECT|INSERT|UPDATE|DELETE|mongoose|findOne|find\()/i)) {
      tags.add('database');
    }

    // Async code detection
    if (code.match(/(async|await|Promise|then)/)) {
      tags.add('async');
    }

    return Array.from(tags);
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    const detectedTags = autoDetectTags(newCode);
    
    // Log for debugging
    console.log('Detected tags:', detectedTags);
    
    setSnippet(prevSnippet => ({
      ...prevSnippet,
      code: newCode,
      tags: Array.from(new Set([...prevSnippet.tags, ...detectedTags]))
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get both auto-detected and custom tags
      const currentCodeTags = autoDetectTags(snippet.code);
      const allTags = Array.from(new Set([...snippet.tags, ...currentCodeTags]));
      
      const payload = {
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        description: snippet.description,
        tags: allTags
      };

      console.log('Submitting payload:', payload);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/snippets`,
        payload,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Server response:', response.data);
      toast.success('Snippet saved successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving snippet:', err);
      toast.error(err.response?.data?.message || 'Error saving snippet');
    }
  };

  const removeTag = (tagToRemove) => {
    setSnippet({
      ...snippet,
      tags: snippet.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const addCustomTag = (e) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      e.preventDefault(); // Prevent form submission
      const newTag = customTagInput.trim().toLowerCase();
      
      setSnippet(prevSnippet => ({
        ...prevSnippet,
        tags: [...new Set([...prevSnippet.tags, newTag])] // Ensure unique tags
      }));
      setCustomTagInput('');
    }
  };

  return (
    <div className="snippet-container">
      <h1>New Snippet</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={snippet.title}
            onChange={(e) => setSnippet({...snippet, title: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>Language</label>
          <select
            value={snippet.language}
            onChange={(e) => setSnippet({...snippet, language: e.target.value})}
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Code</label>
          <textarea
            value={snippet.code}
            onChange={handleCodeChange}
            rows={10}
            required
          />
          <div className="preview">
            <h3>Preview:</h3>
            <SyntaxHighlighter language={snippet.language} style={docco}>
              {snippet.code}
            </SyntaxHighlighter>
          </div>
        </div>

        <div className="form-group">
          <label>Description (optional)</label>
          <textarea
            value={snippet.description}
            onChange={(e) => setSnippet({...snippet, description: e.target.value})}
            rows={3}
          />
        </div>

        <div className="tags-container">
          <label>Tags (auto-detected and custom)</label>
          <input
            type="text"
            placeholder="Add custom tag and press Enter"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={addCustomTag}
            className="tag-input"
          />
          <div className="tags-list">
            {snippet.tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>&times;</button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className="btn">Save Snippet</button>
      </form>
    </div>
  );
}

export default NewSnippet; 