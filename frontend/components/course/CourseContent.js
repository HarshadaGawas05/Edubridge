import React, { useState, useEffect, useRef } from "react";
import YouTube from "react-youtube";

const CourseContent = ({ content, isEnrolled, onProgressUpdate }) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const progressInterval = useRef(null);
  const PREVIEW_TIME_LIMIT = 300; // 5 minutes in seconds

  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const onReady = (event) => {
    setPlayer(event.target);
  };

  const onStateChange = (event) => {
    // YouTube player states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
    if (event.data === 1) {
      setIsPlaying(true);
      startProgressTracking();
    } else if (event.data === 0) {
      // Video ended
      setIsPlaying(false);
      stopProgressTracking();
      if (isEnrolled) {
        onProgressUpdate({
          completed: true,
          progress: 20, // Increment progress by 20% for each completed video
        });
      }
    } else {
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const startProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (player && typeof player.getCurrentTime === "function") {
        const currentTime = player.getCurrentTime();
        setWatchTime(currentTime);

        // If not enrolled and exceeded preview time, pause the video
        if (!isEnrolled && currentTime >= PREVIEW_TIME_LIMIT) {
          player.pauseVideo();
          player.seekTo(0);
          setIsPlaying(false);
          stopProgressTracking();
          alert("Please enroll in the course to watch the full content!");
        }
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const opts = {
    height: "500",
    width: "100%",
    playerVars: {
      autoplay: 0,
    },
  };

  if (!content || !Array.isArray(content)) {
    return (
      <div className="alert alert-warning">
        No content available for this course.
      </div>
    );
  }

  return (
    <div className="course-content">
      {content.map((item, index) => {
        const videoId = item.videoUrl ? getYouTubeId(item.videoUrl) : null;

        return (
          <div key={index} className="content-item mb-4">
            <h5>{item.title}</h5>
            {videoId ? (
              <div className="video-container">
                <YouTube
                  videoId={videoId}
                  opts={opts}
                  onReady={onReady}
                  onStateChange={onStateChange}
                />
                {!isEnrolled && (
                  <div className="preview-notice mt-2 alert alert-info">
                    <i className="fas fa-info-circle mr-2"></i>
                    Preview available for first 5 minutes. Enroll to watch full
                    content.
                  </div>
                )}
              </div>
            ) : (
              <div className="alert alert-warning">
                Video URL is invalid or not provided.
              </div>
            )}
            {item.description && (
              <div className="content-description mt-2">
                <p>{item.description}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CourseContent;
