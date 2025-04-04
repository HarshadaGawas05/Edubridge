import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { getYouTubeId } from "../../utils/getYoutubeId";

// Dynamically import YouTube with SSR disabled
const YouTube = dynamic(() => import("react-youtube"), { ssr: false });

const VideoPlayer = ({
  videoUrl,
  contentId,
  courseId,
  access_token,
  onProgressUpdate,
}) => {
  const [player, setPlayer] = useState(null);
  const [lastPosition, setLastPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef(null);
  const playerRef = useRef(null);

  // YouTube player options
  const opts = {
    height: "390",
    width: "100%",
    playerVars: {
      autoplay: 0,
      start: Math.floor(lastPosition),
      origin: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
      modestbranding: 1,
      rel: 0,
      controls: 1,
      enablejsapi: 1,
    },
  };

  const calculateMilestoneProgress = (currentTime, totalDuration) => {
    if (totalDuration <= 0) return 0;

    const percentage = (currentTime / totalDuration) * 100;

    // Return milestone progress (0, 50, or 100)
    if (percentage >= 90) return 100;
    if (percentage >= 50) return 50;
    return Math.floor(percentage); // Return actual percentage for progress under 50%
  };

  const updateProgress = () => {
    if (!playerRef.current) return;

    try {
      const currentTime = playerRef.current.getCurrentTime();
      const totalDuration = playerRef.current.getDuration();

      if (totalDuration) {
        const currentProgress = calculateMilestoneProgress(
          currentTime,
          totalDuration
        );

        // Update progress at 50% and 100% milestones
        if (currentProgress >= 50 && progress < 50) {
          setProgress(50);
          saveProgress(playerRef.current, 50);
        } else if (currentProgress >= 90 && progress < 100) {
          setProgress(100);
          saveProgress(playerRef.current, 100);
        }
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  const handleStateChange = (event) => {
    if (!event.target) return;
    playerRef.current = event.target;
    setPlayer(event.target);

    const videoPlayer = event.target;
    const videoDuration = videoPlayer.getDuration();
    setDuration(videoDuration);

    switch (event.data) {
      case 1: // PLAYING
        setIsPlaying(true);
        setPlayerError(null);
        // Start progress tracking
        if (progressInterval.current) clearInterval(progressInterval.current);
        progressInterval.current = setInterval(updateProgress, 5000); // Check every 5 seconds
        break;
      case 2: // PAUSED
        setIsPlaying(false);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
        updateProgress(); // Check progress on pause
        break;
      case 0: // ENDED
        setIsPlaying(false);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
          progressInterval.current = null;
        }
        setProgress(100);
        saveProgress(videoPlayer, 100);
        break;
      case -1: // UNSTARTED
        loadProgress();
        break;
    }
  };

  const saveProgress = async (videoPlayer, currentProgress) => {
    if (!videoPlayer) return;

    try {
      const currentTime = videoPlayer.getCurrentTime();
      const videoDuration = videoPlayer.getDuration();

      console.log("Saving milestone progress:", {
        currentTime,
        videoDuration,
        progress: currentProgress,
        timestamp: new Date().toISOString(),
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/content/${contentId}/progress/`,
        {
          watched_duration: currentTime,
          total_duration: videoDuration,
          last_position: currentTime,
          completed: currentProgress >= 50, // Mark as completed at 50%
          progress: currentProgress,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      // Call the onProgressUpdate prop with the course progress
      if (onProgressUpdate && response.data.course_progress !== undefined) {
        onProgressUpdate(response.data.course_progress);
      }
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  // Load saved progress
  const loadProgress = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/content/${contentId}/progress/`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      if (res.data.last_position) {
        setLastPosition(res.data.last_position);
        setProgress(res.data.progress || 0);
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error("Error loading progress:", error);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (playerRef.current) {
        saveProgress(playerRef.current);
      }
    };
  }, []);

  return (
    <div className="video-player">
      <YouTube
        videoId={getYouTubeId(videoUrl)}
        opts={opts}
        onStateChange={handleStateChange}
        onError={(error) => {
          console.error("YouTube Player Error:", error);
          setPlayerError("Failed to load video. Please try again.");
        }}
        className="youtube-player"
      />
      {playerError && (
        <div className="alert alert-warning mt-2">{playerError}</div>
      )}
      <div className="progress-container mt-3">
        <div
          className="progress"
          style={{
            height: "24px",
            backgroundColor: "#e9ecef",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            className="progress-bar"
            role="progressbar"
            style={{
              width: `${progress}%`,
              transition: "width 0.5s ease",
              backgroundColor: "#007bff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "14px",
              fontWeight: "500",
            }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {progress === 0 && "Just Started"}
            {progress === 50 && "Halfway There! (50%)"}
            {progress === 100 && "Completed! (100%)"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
