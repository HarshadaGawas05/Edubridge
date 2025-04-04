import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import { toast } from "react-hot-toast";

const MyCourses = ({ courses, access_token }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      setLoading(true);
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/courses/${courseId}/delete/`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        toast.success("Course deleted successfully");
        router.reload(); // Refresh the page to update the list
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to delete course");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Learning</h2>
      {courses.length === 0 ? (
        <div className="alert alert-info">
          You haven't enrolled in any courses yet.{" "}
          <Link href="/courses">Browse Courses</Link>
        </div>
      ) : (
        <div className="row">
          {courses.map((enrollment) => (
            <div key={enrollment.id} className="col-md-4 mb-4">
              <div className="card h-100">
                {enrollment.course.thumbnail && (
                  <img
                    src={enrollment.course.thumbnail}
                    className="card-img-top"
                    alt={enrollment.course.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="card-title">{enrollment.course.title}</h5>
                    {enrollment.course.user ===
                      localStorage.getItem("userId") && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(enrollment.course.id)}
                        disabled={loading}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                  <p className="card-text text-muted">
                    Instructor: {enrollment.course.instructor}
                  </p>
                  <div className="progress mb-3">
                    <div
                      className="progress-bar"
                      role="progressbar"
                      style={{
                        width: `${enrollment.progress}%`,
                        backgroundColor: getProgressColor(enrollment.progress),
                      }}
                      aria-valuenow={enrollment.progress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {enrollment.progress}% Complete
                    </div>
                  </div>
                  <Link
                    href={`/courses/${enrollment.course.id}`}
                    className="btn btn-primary w-100"
                  >
                    Continue Learning
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const getProgressColor = (progress) => {
  if (progress < 30) return "#dc3545"; // red
  if (progress < 70) return "#ffc107"; // yellow
  return "#28a745"; // green
};

export default MyCourses;
