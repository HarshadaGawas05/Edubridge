import axios from "axios";
import { useState, createContext } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const JobContext = createContext();

export const JobProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);
  const [updated, setUpdated] = useState(null);
  const [deleted, setDeleted] = useState(null);
  const [applied, setApplied] = useState(false);
  const [stats, setStats] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [courseProgress, setCourseProgress] = useState({});

  const router = useRouter();

  const handleAuthError = (error) => {
    if (error.response && error.response.status === 401) {
      toast.error("Your session has expired. Please login again.");
      router.push("/login");
      return true;
    }
    return false;
  };

  // Create a new job
  const newJob = async (data, access_token) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.API_URL}/api/jobs/new/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (res.data) {
        setLoading(false);
        setCreated(true);
      }
    } catch (error) {
      setLoading(false);
      if (!handleAuthError(error)) {
        setError(
          error.response &&
            (error.response.data.detail || error.response.data.error)
        );
      }
    }
  };

  // Update job
  const updateJob = async (id, data, access_token) => {
    try {
      setLoading(true);

      const res = await axios.put(
        `${process.env.API_URL}/api/jobs/${id}/update/`,
        data,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (res.data) {
        setLoading(false);
        setUpdated(true);
      }
    } catch (error) {
      setLoading(false);
      if (!handleAuthError(error)) {
        setError(
          error.response &&
            (error.response.data.detail || error.response.data.error)
        );
      }
    }
  };

  // Apply to Job
  const applyToJob = async (id, access_token) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.API_URL}/api/jobs/${id}/apply/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (res.data.applied === true) {
        setLoading(false);
        setApplied(true);
      }
    } catch (error) {
      setLoading(false);
      if (!handleAuthError(error)) {
        setError(
          error.response &&
            (error.response.data.detail || error.response.data.error)
        );
      }
    }
  };

  // Check job applied
  const checkJobApplied = async (id, access_token) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.API_URL}/api/jobs/${id}/check/`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      setLoading(false);
      setApplied(res.data);
    } catch (error) {
      setLoading(false);
      if (!handleAuthError(error)) {
        setError(
          error.response &&
            (error.response.data.detail || error.response.data.error)
        );
      }
    }
  };

  // Get topic stats
  const getTopicStats = async (topic) => {
    try {
      setLoading(true);

      const res = await axios.get(`${process.env.API_URL}/api/stats/${topic}/`);

      setLoading(false);
      setStats(res.data);
    } catch (error) {
      setLoading(false);
      setError(
        error.response &&
          (error.response.data.detail || error.response.data.error)
      );
    }
  };

  // Delete job
  const deleteJob = async (id, access_token) => {
    try {
      setLoading(true);

      const res = await axios.delete(
        `${process.env.API_URL}/api/jobs/${id}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      setLoading(false);
      setDeleted(true);
    } catch (error) {
      setLoading(false);
      if (!handleAuthError(error)) {
        setError(
          error.response &&
            (error.response.data.detail || error.response.data.error)
        );
      }
    }
  };

  // Clear Errors
  const clearErrors = () => {
    setError(null);
  };

  // Enroll in course
  const enrollCourse = async (courseId, access_token) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.API_URL}/api/courses/${courseId}/enroll/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (res.data) {
        setLoading(false);
        setEnrolled(true);
        toast.success("Successfully enrolled in the course!");
        router.push("/me/courses");
      }
    } catch (error) {
      setLoading(false);
      if (!handleAuthError(error)) {
        setError(
          error.response?.data?.detail ||
            error.response?.data?.error ||
            "Failed to enroll in the course"
        );
      }
    }
  };

  // Get course progress
  const getCourseProgress = async (courseId, access_token) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${process.env.API_URL}/api/courses/${courseId}/progress/`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      setLoading(false);
      return res.data;
    } catch (error) {
      setLoading(false);
      setError(
        error.response &&
          (error.response.data.detail || error.response.data.error)
      );
    }
  };

  // Update course content progress
  const updateCourseProgress = async (courseId, contentId, progressData, access_token) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${process.env.API_URL}/api/courses/${courseId}/content/${contentId}/progress/`,
        progressData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      setLoading(false);
      return res.data;
    } catch (error) {
      setLoading(false);
      setError(
        error.response &&
          (error.response.data.detail || error.response.data.error)
      );
    }
  };

  // Get user's enrolled courses
  const getUserCourses = async (access_token) => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.API_URL}/api/me/courses/`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      setLoading(false);
      return res.data;
    } catch (error) {
      setLoading(false);
      if (!handleAuthError(error)) {
        setError(
          error.response?.data?.error ||
            "Something went wrong while fetching your courses"
        );
      }
      return [];
    }
  };

  // Create a new course
  const createCourse = async (data, access_token) => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.API_URL}/api/courses/new/`,
        {
          title: data.title,
          description: data.description,
          instructor: data.instructor,
          level: data.level,
          industry: data.industry,
          skills: data.skills,
          duration_weeks: data.duration_weeks,
          video_url: data.video_url, // This will be handled by backend
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      if (res.data) {
        setLoading(false);
        toast.success("Course posted successfully");
        router.push("/courses");
      }
    } catch (error) {
      setLoading(false);
      if (!handleAuthError(error)) {
        setError(
          error.response?.data?.error ||
            "Something went wrong while creating the course"
        );
      }
    }
  };

  // Delete a course
  const deleteCourse = async (id, access_token) => {
    try {
      setLoading(true);
      const res = await axios.delete(`${process.env.API_URL}/api/courses/${id}/`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (res.data) {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setError(
        error.response &&
          (error.response.data.detail || error.response.data.error)
      );
    }
  };

  return (
    <JobContext.Provider
      value={{
        loading,
        error,
        created,
        updated,
        deleted,
        applied,
        stats,
        enrolled,
        courseProgress,
        newJob,
        updateJob,
        deleteJob,
        getTopicStats,
        applyToJob,
        setUpdated,
        checkJobApplied,
        setCreated,
        setDeleted,
        clearErrors,
        enrollCourse,
        getCourseProgress,
        updateCourseProgress,
        createCourse,
        getUserCourses,
        deleteCourse,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export default JobContext;
