import Layout from "../../components/layout/Layout";
import NewCourse from "../../components/course/NewCourse";
import { isAuthenticatedUser } from "../../utils/isAuthenticated";

export default function NewCoursePage({ access_token }) {
  return (
    <Layout title="Post a new Course">
      <NewCourse access_token={access_token} />
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

  return {
    props: {
      access_token,
    },
  };
}
