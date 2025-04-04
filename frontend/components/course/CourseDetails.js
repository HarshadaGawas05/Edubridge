import { useContext, useEffect, useState } from "react";
import JobContext from "../../context/JobContext";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import axios from "axios";
import dynamic from "next/dynamic";

// Dynamically import VideoPlayer with SSR disabled
const VideoPlayer = dynamic(() => import("./VideoPlayer"), { ssr: false });

const CourseDetails = ({
  course,
  access_token,
  isEnrolled: initialIsEnrolled,
  enrolledCount,
}) => {
  const { error, clearErrors, updateCourseProgress } = useContext(JobContext);
  const [loading, setLoading] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(initialIsEnrolled);
  const [progress, setProgress] = useState(0);
  const [contentProgress, setContentProgress] = useState({});
  const [isOwner, setIsOwner] = useState(false);
  const router = useRouter();
  const [activeVideo, setActiveVideo] = useState(null);
  const [playerError, setPlayerError] = useState(null);
  const [videoProgress, setVideoProgress] = useState({});
  const [currentTime, setCurrentTime] = useState(0);

  // Get origin safely
  const getOrigin = () => {
    if (typeof window !== "undefined") {
      return window.location.origin;
    }
    return "";
  };

  // YouTube player options
  const opts = {
    height: "390",
    width: "100%",
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
      controls: 1,
      enablejsapi: 1,
      origin: getOrigin(),
      host: "https://www.youtube-nocookie.com",
      playsinline: 1,
      fs: 1,
    },
  };

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setIsOwner(course.user?.toString() === userId);

    const checkEnrollment = async () => {
      if (!access_token) return;
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${course.id}/check-enrollment/`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        setIsEnrolled(res.data.isEnrolled);
        if (res.data.isEnrolled) {
          setProgress(res.data.progress || 0);
          fetchProgress();
        }
      } catch (error) {
        console.error("Error checking enrollment:", error);
      }
    };

    checkEnrollment();

    if (error) {
      toast.error(error);
      clearErrors();
    }
  }, [course.id, course.user, access_token, error]);

  const fetchProgress = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${course.id}/progress/`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      setProgress(res.data.progress);
      setContentProgress(res.data.contentProgress || {});
    } catch (error) {
      console.error("Error fetching progress:", error);
    }
  };

  const enrollHandler = async () => {
    if (!access_token) {
      router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${course.id}/enroll/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      setIsEnrolled(true);
      toast.success("Successfully enrolled in the course!");
      router.push("/me/courses");
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to enroll in the course");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (progressData) => {
    if (!access_token) {
      const currentPath = router.asPath;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    try {
      await updateCourseProgress(course.id, progressData, access_token);
      setProgress(progressData);
    } catch (err) {
      toast.error("Failed to update progress");
    }
  };

  // Function to extract YouTube video ID and validate it
  const getYouTubeVideoId = (url) => {
    if (!url) return null;

    try {
      let videoId = null;

      if (url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(new URL(url).search);
        videoId = urlParams.get("v");
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1].split("?")[0];
      } else if (url.includes("youtube-nocookie.com/embed/")) {
        videoId = url.split("embed/")[1].split("?")[0];
      }

      return videoId;
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
      return null;
    }
  };

  // Load initial video when component mounts
  useEffect(() => {
    if (course?.contents?.length > 0) {
      setActiveVideo(course.contents[0]);
    }
  }, [course]);

  // Function to handle video progress
  const handleVideoProgress = (newProgress) => {
    setProgress(newProgress);
  };

  // Render video section
  const renderVideo = () => {
    if (!activeVideo) return null;

    return (
      <div className="video-wrapper mb-4">
        <div className="video-container">
          {playerError && (
            <div className="alert alert-warning mb-3">{playerError}</div>
          )}
          <div className="youtube-player-wrapper">
            <VideoPlayer
              videoUrl={activeVideo.video_url}
              contentId={activeVideo.id}
              courseId={course.id}
              access_token={access_token}
              onProgressUpdate={handleVideoProgress}
            />
          </div>
        </div>
        <div className="mt-3">
          <h5>{activeVideo.title}</h5>
          {videoProgress[activeVideo.id] > 0 && (
            <div className="progress mt-2" style={{ height: "5px" }}>
              <div
                className="progress-bar"
                role="progressbar"
                style={{ width: `${videoProgress[activeVideo.id]}%` }}
                aria-valuenow={videoProgress[activeVideo.id]}
                aria-valuemin="0"
                aria-valuemax="100"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setLoading(true);
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${course.id}/delete/`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        toast.success("Course deleted successfully");
        router.push("/courses");
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to delete course");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <div className="job-details-wrapper">
      <div className="container container-fluid">
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="job-details p-3">
              <div className="job-header p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <h2>{course.title}</h2>
                  {isOwner && (
                    <button
                      className="btn btn-danger"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      <i className="fas fa-trash"></i> Delete Course
                    </button>
                  )}
                </div>
                <div className="mt-2">
                  <span className="mr-4">
                    <i className="fas fa-clock"></i>
                    <span className="ml-2">Duration: {course.duration}</span>
                  </span>
                  <span>
                    <i className="fas fa-users"></i>
                    <span className="ml-2">
                      {enrolledCount} students enrolled
                    </span>
                  </span>
                </div>
              </div>

              <div className="job-description mt-5">
                <h4>Description:</h4>
                <p>{course.description}</p>
              </div>

              {/* Course Content */}
              {course.contents && course.contents.length > 0 && (
                <div className="job-details p-3 mt-4">
                  <h4 className="mb-4">Course Content</h4>
                  {renderVideo()}
                  {/* Content List */}
                  <div className="content-list">
                    {course.contents.map((content) => (
                      <div
                        key={content.id}
                        className={`content-item p-3 ${
                          activeVideo?.id === content.id ? "active" : ""
                        }`}
                        onClick={() => {
                          setPlayerError(null);
                          setActiveVideo(content);
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <i className="fas fa-play-circle mr-2"></i>
                            {content.title}
                          </div>
                          <span className="duration">
                            {content.duration_minutes} min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.videoUrl && (
                <div className="course-video mt-4">
                  <h4>Course Preview:</h4>
                  <div className="video-container mt-3">
                    <video
                      controls
                      width="100%"
                      className="rounded shadow"
                      poster={course.thumbnail}
                    >
                      <source src={course.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="col-xl-3 col-lg-4">
            <div className="job-contact-details p-3">
              <h4 className="my-4">Course Status</h4>
              {isEnrolled ? (
                <div>
                  <div className="progress mb-3">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${progress}%`,
                        backgroundColor:
                          progress >= 100 ? "#28a745" : "#007bff",
                        transition: "width 0.5s ease",
                      }}
                      aria-valuenow={progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {Math.round(progress)}% Complete
                    </div>
                  </div>
                  <p className="text-success">
                    {progress >= 100
                      ? "Course Completed!"
                      : "You are enrolled in this course"}
                  </p>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => router.push("/me/courses")}
                  >
                    Go to My Learning
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={enrollHandler}
                    disabled={loading || isEnrolled}
                  >
                    {loading ? "Enrolling..." : "Enroll Now"}
                  </button>
                  <p className="text-muted mt-2 text-center">
                    Join {enrolledCount} other students
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
