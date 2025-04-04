import Layout from "../../components/layout/Layout";
import MyCourses from "../../components/course/MyCourses";
import { isAuthenticatedUser } from "../../utils/isAuthenticated";
import axios from "axios";

export default function MyCoursesPage({ courses, access_token }) {
  return (
    <Layout title="My Courses">
      <MyCourses courses={courses} access_token={access_token} />
    </Layout>
  );
}

export async function getServerSideProps({ req }) {
  const access_token = req.cookies.access;

  const user = await isAuthenticatedUser(access_token);

  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/me/courses/`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    return {
      props: {
        courses: res.data,
        access_token,
      },
    };
  } catch (error) {
    console.error("Error fetching courses:", error);
    return {
      props: {
        courses: [],
        access_token,
      },
    };
  }
}
