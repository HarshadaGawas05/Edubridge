import Layout from "../../components/layout/Layout";
import CourseDetails from "../../components/course/CourseDetails";
import { isAuthenticatedUser } from "../../utils/isAuthenticated";
import axios from "axios";

export default function CourseDetailsPage({
  course,
  error,
  access_token,
  isEnrolled,
  enrolledCount,
}) {
  if (error) {
    return (
      <Layout title="Error">
        <div className="alert alert-danger">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout title={course.title}>
      <CourseDetails
        course={course}
        access_token={access_token}
        isEnrolled={isEnrolled}
        enrolledCount={enrolledCount}
      />
    </Layout>
  );
}

export async function getServerSideProps({ req, params }) {
  const access_token = req.cookies.access;

  try {
    // Get course details
    const res = await axios.get(
      `${process.env.API_URL}/api/courses/${params.id}/`,
      access_token
        ? {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        : {}
    );

    // Check enrollment if user is authenticated
    let isEnrolled = false;
    if (access_token) {
      const enrollRes = await axios.get(
        `${process.env.API_URL}/api/courses/${params.id}/check-enrollment/`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      isEnrolled = enrollRes.data.isEnrolled;
    }

    return {
      props: {
        course: res.data.course,
        enrolledCount: res.data.enrolled_count,
        access_token: access_token || null,
        isEnrolled,
      },
    };
  } catch (error) {
    console.error("Error fetching course:", error);
    return {
      props: {
        error: "Unable to load course. Please try again later.",
        access_token: access_token || null,
      },
    };
  }
}
