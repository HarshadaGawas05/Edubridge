import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

const MyLearning = ({ access_token }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/me/courses/`,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
        setEnrolledCourses(res.data);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (access_token) {
      fetchEnrolledCourses();
    }
  }, [access_token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="row">
      {enrolledCourses.map((enrollment) => (
        <div key={enrollment.id} className="col-lg-4 col-md-6 mb-4">
          <div className="card course-card">
            <div className="card-body">
              <Link
                href={`/courses/${enrollment.course.id}`}
                className="text-decoration-none"
              >
                <h5 className="card-title">{enrollment.course.title}</h5>
              </Link>
              <div className="mt-3">
                <div className="progress" style={{ height: "20px" }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{
                      width: `${enrollment.progress}%`,
                      backgroundColor:
                        enrollment.progress >= 100 ? "#28a745" : "#007bff",
                      transition: "width 0.5s ease",
                    }}
                    aria-valuenow={enrollment.progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {enrollment.progress}% Complete
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <span
                  className={`badge ${
                    enrollment.progress >= 100 ? "bg-success" : "bg-primary"
                  }`}
                >
                  {enrollment.progress >= 100 ? "Completed" : "In Progress"}
                </span>
              </div>
              <Link
                href={`/courses/${enrollment.course.id}`}
                className="btn btn-primary mt-3 w-100"
              >
                {enrollment.progress >= 100
                  ? "Review Course"
                  : "Continue Learning"}
              </Link>
            </div>
          </div>
        </div>
      ))}
      {enrolledCourses.length === 0 && (
        <div className="col-12">
          <div className="alert alert-info">
            You haven't enrolled in any courses yet.{" "}
            <Link href="/courses">Browse Courses</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLearning;
