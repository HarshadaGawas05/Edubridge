// Main courses listing page
import Layout from "../../components/layout/Layout";
import CourseList from "../../components/course/CourseList";
import axios from "axios";

export default function CoursesPage({ courses, error, access_token }) {
  // Debug logs
  console.log("Access Token Present:", !!access_token);
  console.log("Number of Courses:", courses?.length);
  console.log("Courses Data:", courses);

  if (error) {
    return (
      <Layout title="Error">
        <div className="alert alert-danger">
          <b>Error: </b> {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="All Courses">
      <div className="container container-fluid">
        <div className="row">
          <div className="col-12">
            <h1 className="page-title">Available Courses</h1>
            <CourseList courses={courses} access_token={access_token} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ req }) {
  try {
    const access_token = req.cookies.access;
    console.log("Server-side Access Token Present:", !!access_token);

    // Get courses with authorization header
    const res = await axios.get(`${process.env.API_URL}/api/courses/`, {
      headers: {
        ...(access_token && { Authorization: `Bearer ${access_token}` }),
      },
    });

    console.log("Server-side Courses Response:", res.data);

    return {
      props: {
        courses: res.data.courses || [],
        error: null,
        access_token: access_token || null,
      },
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return {
      props: {
        courses: [],
        error: "Unable to fetch courses. Please try again later.",
        access_token: null,
      },
    };
  }
}
