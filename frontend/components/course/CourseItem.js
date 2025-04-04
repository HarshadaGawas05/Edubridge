import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const CourseItem = ({ course, access_token, onDelete }) => {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOwnership = async () => {
      try {
        if (!access_token) {
          console.log("No access token available");
          setLoading(false);
          return;
        }

        // Get user info from API
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/me/`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        // Debug logs
        console.log("Current User Data:", response.data);
        console.log("Course Data:", course);
        console.log("Course User ID:", course.user);
        console.log("Current User ID:", response.data.id);

        // Compare user IDs
        const isOwnerCheck = response.data.id === course.user;
        console.log("Is Owner Check Result:", isOwnerCheck);

        setIsOwner(isOwnerCheck);
        setLoading(false);
      } catch (error) {
        console.error("Error checking ownership:", error);
        setLoading(false);
      }
    };

    if (access_token && course.user) {
      checkOwnership();
    } else {
      setLoading(false);
    }
  }, [access_token, course.user]);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!access_token) {
      toast.error("Please login to delete the course");
      router.push("/login");
      return;
    }

    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        const response = await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${course.id}/delete/`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );

        if (response.status === 200) {
          toast.success("Course deleted successfully");
          if (onDelete) {
            onDelete(course.id);
          } else {
            router.push("/courses");
          }
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error(error.response?.data?.error || "Failed to delete course");
      }
    }
  };

  return (
    <div className="card course-card">
      <div className="position-relative">
        {!loading && isOwner && (
          <button
            onClick={handleDelete}
            className="btn btn-danger position-absolute"
            style={{
              top: "10px",
              right: "10px",
              zIndex: 1000,
              padding: "8px 12px",
              opacity: 1,
              backgroundColor: "#dc3545",
              border: "none",
              color: "white",
              cursor: "pointer",
            }}
          >
            <i className="fas fa-trash"></i>
          </button>
        )}
        <Link href={`/courses/${course.id}`} className="text-decoration-none">
          <div>
            <img
              src={course.thumbnail || "/images/default-course.jpg"}
              alt={course.title}
              className="card-img-top"
              style={{ height: "200px", objectFit: "cover" }}
              onError={(e) => {
                e.target.src = "/images/default-course.jpg";
              }}
            />
            <div className="card-body">
              <h5 className="card-title">{course.title}</h5>
              <p className="card-text text-muted">
                <i className="fas fa-user"></i> {course.instructor}
              </p>
              <p className="card-text">
                {course.description.substring(0, 100)}...
              </p>
              <div className="mt-3">
                <span className="badge bg-primary me-2">{course.level}</span>
                <span className="badge bg-secondary">
                  {course.duration_weeks} weeks
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default CourseItem;
