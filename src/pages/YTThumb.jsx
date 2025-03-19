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
import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import DOMPurify from 'dompurify';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AppAppBar from '../components/AppAppBar';
import Grid from '@mui/material/Grid2';
import {
  Typography,
  FormControl,
  InputLabel,
  InputAdornment,
  Input,
  Button,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
} from '@mui/material';
import Footer from '../components/Footer';

function useTitle(title) {
  React.useEffect(() => {
    const prevTitle = document.title;
    document.title = title;
    return () => {
      document.title = prevTitle;
    };
  });
}

export default function YTThumb({ setMode, mode, app }) {
  useTitle('theJunkyard: YTThumb');
  const defaultTheme = createTheme({ palette: { mode } });

  const [url, setUrl] = React.useState('');
  const [thumbnailUrl, setThumbnailUrl] = React.useState('');
  const [thumbnailIndex, setThumbnailIndex] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const thumbnailSizesRef = React.useRef([]);

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

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <AppAppBar mode={mode} toggleColorMode={setMode} />
      <Box
        sx={(theme) => ({
          width: '100%',
          backgroundImage:
            theme.palette.mode === 'light'
              ? 'linear-gradient(180deg, #CEE5FD, #FFF)'
              : `linear-gradient(#02294F, ${alpha('#090E10', 0.0)})`,
          backgroundSize: '100% 20%',
          backgroundRepeat: 'no-repeat',
        })}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 3, sm: 6 },
            pt: { xs: 12, sm: 15 },
            px: { xs: 2 },
          }}
        >
          <Container maxWidth="lg">
            <Grid
              container
              spacing={3}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Grid size={12}>
                <Typography component="h1" variant="h3" sx={{
                    display: {xs: 'flex', sm: 'flex'},
                    flexDirection: { xs: 'column', md: 'row' },
                    alignSelf: 'left',
                    textAlign: 'left',
                    fontSize: {xs: 'clamp(3.4rem, 10vw, 4rem)', sm: 'clamp(3.5rem, 10vw, 4rem)'},
                    fontWeight: 'bold',
                    pb: '0.25rem',
                  }}>
                  YouTube Thumbnail Downloader
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Input the URL of a YouTube video to get the highest quality available version of the thumbnail.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <FormControl sx={{ width: '100%' }}>
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
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={fetchThumbnail}
                  disabled={!url || loading}
                  sx={{
                    width: '100%',
                  }}
                >
                  Fetch Thumbnail
                </Button>
              </Grid>

              {thumbnailUrl && (
                <Grid
                  size={12}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={DOMPurify.sanitize(thumbnailUrl)}
                    alt="YouTube Video Thumbnail"
                    onError={handleImageError}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '400px',
                      objectFit: 'contain',
                    }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleDownload}
                    sx={{ mt: 2 }}
                  >
                    Download Thumbnail
                  </Button>
                </Grid>
              )}
            </Grid>
          </Container>
        </Box>
      </Box>
      <Divider sx={{ pt: { sm: 8 }, display: { xs: 'none', sm: 'inherit' } }} />
      <Footer />

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
    </ThemeProvider>
  );
}

YTThumb.propTypes = {
  setMode: PropTypes.func.isRequired,
  mode: PropTypes.string.isRequired,
};
