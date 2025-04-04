export const getYouTubeId = (url) => {
  if (!url) return null;

  // Regular expressions to match YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
    /^[a-zA-Z0-9_-]{11}$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // If the URL is already an ID (11 characters)
  if (url.length === 11) {
    return url;
  }

  return null;
};
