import React from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import StarIcon from '@mui/icons-material/Star';
// import { useAuth } from '../contexts/AuthContext';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const SnippetCard = ({ snippet, onBookmark, onStar }) => {
  // const { user } = useAuth();

  const handleBookmark = (e) => {
    e.stopPropagation();
    onBookmark(snippet._id);
  };

  const handleStar = (e) => {
    e.stopPropagation();
    onStar(snippet._id);
  };

  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 3
      }
    }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2" noWrap>
            {snippet.title}
          </Typography>
          <Box>
            <IconButton 
              onClick={handleBookmark}
              color={snippet.isBookmarked ? 'primary' : 'default'}
              size="small"
            >
              <BookmarkIcon />
            </IconButton>
            <IconButton 
              onClick={handleStar}
              color={snippet.isStarred ? 'warning' : 'default'}
              size="small"
            >
              <StarIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {snippet.language}
        </Typography>
        {snippet.description && (
          <Typography variant="body2" sx={{ mb: 2 }}>
            {snippet.description}
          </Typography>
        )}
        {snippet.code && (
          <Box sx={{ 
            mb: 2,
            borderRadius: 1,
            overflow: 'hidden',
            '& pre': {
              margin: 0,
              padding: '8px !important',
              fontSize: '0.875rem'
            }
          }}>
            <SyntaxHighlighter language={snippet.language.toLowerCase()} style={docco}>
              {snippet.code}
            </SyntaxHighlighter>
          </Box>
        )}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {snippet.tags?.map((tag, index) => (
            <Typography
              key={index}
              variant="caption"
              sx={{
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                px: 1,
                py: 0.5,
                borderRadius: 1
              }}
            >
              {tag}
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SnippetCard; 