// Copyright (c) 2025 Alex Frutkin
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (theJunkyard), to deal in
// theJunkyard without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// theJunkyard, and to permit persons to whom theJunkyard is furnished to do so,
// subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of theJunkyard.
// 
// THEJUNKYARD IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THEJUNKYARD OR THE USE OR OTHER DEALINGS IN THEJUNKYARD.

import * as React from 'react';
import PropTypes from 'prop-types';
import PageLayout from '../components/PageLayout'; // Import PageLayout
import { useTitle } from '../components/useTitle';
import DOMPurify from 'dompurify';
import {
  Typography,
  FormControl,
  InputLabel,
  InputAdornment,
  Input,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';

/**
 * YTThumb component allows users to fetch and download YouTube video thumbnails.
 * @param {object} props - The component's props.
 * @param {function} props.setMode - Function to toggle the color mode (light/dark).
 * @param {string} props.mode - The current color mode ('light' or 'dark').
 * @param {object} props.app - Firebase app instance (currently unused in this component directly).
 */
export default function YTThumb({ setMode, mode, app }) {
  useTitle('theJunkyard: YTThumb');
  
  /** @state {string} url - The YouTube URL input by the user. */
  const [url, setUrl] = React.useState('');
  /** @state {string} thumbnailUrl - The URL of the currently displayed thumbnail. */
  const [thumbnailUrl, setThumbnailUrl] = React.useState('');
  /** @state {number} thumbnailIndex - The index of the current thumbnail URL being tried from thumbnailSizesRef. */
  const [thumbnailIndex, setThumbnailIndex] = React.useState(0);
  /** @state {boolean} loading - Indicates if a thumbnail is currently being fetched. */
  const [loading, setLoading] = React.useState(false);
  /** @state {string|null} error - Stores error messages, if any. */
  const [error, setError] = React.useState(null);
  /** @ref {Array<string>} thumbnailSizesRef - Holds an array of potential thumbnail URLs in descending order of quality. */
  const thumbnailSizesRef = React.useRef([]);

  /**
   * Extracts the YouTube video ID from a given URL.
   * Supports standard YouTube watch URLs and shortened youtu.be URLs.
   * @param {string} inputUrl - The YouTube URL.
   * @returns {string} The extracted video ID, or an empty string if extraction fails.
   */
  const extractVideoId = (inputUrl) => {
    try {
      const url = new URL(inputUrl);
      if (url.hostname === 'youtu.be') {
        return url.pathname.slice(1);
      }
      if (url.hostname === 'www.youtube.com' || url.hostname === 'youtube.com') {
        const searchParams = new URLSearchParams(url.search);
        return searchParams.get('v') || '';
      }
      return '';
    } catch (err) {
      return '';
    }
  };

  /**
   * Fetches the YouTube video thumbnail.
   * It extracts the video ID, constructs a list of potential thumbnail URLs,
   * and attempts to load the highest quality one first.
   */
  const fetchThumbnail = () => {
    setLoading(true);
    setError(null);
    setThumbnailUrl('');
    setThumbnailIndex(0);

    const videoId = extractVideoId(url);

    if (!videoId) {
      setError('Invalid YouTube URL');
      setLoading(false);
      return;
    }

    // Store the possible thumbnail URLs
    thumbnailSizesRef.current = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${videoId}/default.jpg`,
    ];

    // Set the initial thumbnail URL
    setThumbnailUrl(DOMPurify.sanitize(thumbnailSizesRef.current[0]));
    setLoading(false);
  };

  /**
   * Handles errors when loading a thumbnail image.
   * If a thumbnail fails to load, it tries the next available size from `thumbnailSizesRef`.
   * If all sizes fail, it sets an error message.
   */
  const handleImageError = () => {
    // Try the next thumbnail URL in the array
    if (thumbnailIndex < thumbnailSizesRef.current.length - 1) {
      const nextIndex = thumbnailIndex + 1;
      setThumbnailIndex(nextIndex);
      setThumbnailUrl(DOMPurify.sanitize(thumbnailSizesRef.current[nextIndex]));
    } else {
      // No more thumbnails to try
      setError('Failed to load thumbnail images.');
    }
  };

  /**
   * Initiates the download of the currently displayed thumbnail image.
   */
  const handleDownload = () => {
    if (thumbnailUrl) {
      const link = document.createElement('a');
      link.href = thumbnailUrl;
      link.download = `youtube_thumbnail_${extractVideoId(url)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  /**
   * Clears the error message, typically used when the error Snackbar is closed.
   */
  const handleCloseError = () => {
    setError(null);
  };

  return (
    <PageLayout mode={mode} setMode={setMode}>
      <Container maxWidth="lg">
        <Typography component="h1" variant="h3" sx={{
          display: { xs: 'flex', sm: 'flex' },
          flexDirection: { xs: 'column', md: 'row' },
          alignSelf: 'left',
          textAlign: 'left',
          fontSize: { xs: 'clamp(3.4rem, 10vw, 4rem)', sm: 'clamp(3.5rem, 10vw, 4rem)' },
          fontWeight: 'bold',
          pb: '0.25rem',
          pt: { xs: 12, sm: 15 }
        }}>
          YouTube Thumbnail Downloader
        </Typography>
        <Typography variant="body1" color="text.secondary" component='p' sx={{ mb: 2 }}>
          Input the URL of a YouTube video to get the highest quality available version of the thumbnail.
        </Typography>
        <FormControl sx={{ width: '100%', mb: 2 }}>
          <InputLabel htmlFor="url">YouTube URL</InputLabel>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
            endAdornment={
              loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : null
            }
          />
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={fetchThumbnail}
          disabled={!url || loading}
          sx={{
            width: '100%',
            mb: 3,
          }}
        >
          Fetch Thumbnail
        </Button>

        {thumbnailUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img
              src={DOMPurify.sanitize(thumbnailUrl)}
              alt="YouTube Video Thumbnail"
              onError={handleImageError}
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                objectFit: 'contain',
                marginBottom: '1rem',
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={handleDownload}
              sx={{ width: '100%' }}
            >
              Download Thumbnail
            </Button>
          </div>
        )}
      </Container>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </PageLayout>
  );
}

YTThumb.propTypes = {
  setMode: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
  /** Firebase app instance, passed but not directly utilized in this component's core logic. */
  app: PropTypes.object, // Firebase app object, can be marked as not required if truly optional
};
