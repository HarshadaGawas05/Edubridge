import React from "react";
import Link from "next/link";
import Pagination from "rc-pagination";
import Filters from "./layout/Filters";
import JobItem from "./job/JobItem";
import { useRouter } from "next/router";

const Home = ({ data }) => {
  const { jobs, count, resPerPage } = data;
  const router = useRouter();

  let { page = 1, keyword } = router.query;
  page = Number(page);

  const handlePageClick = (currentPage) => {
    const currentQuery = { ...router.query };
    currentQuery.page = currentPage;

    router.push({
      pathname: router.pathname,
      query: currentQuery,
    });
  };

  return (
    <div className="container container-fluid">
      <div className="row">
        <div className="col-xl-3 col-lg-4">
          <Filters />
        </div>

        <div className="col-xl-9 col-lg-8 content-left-offset">
          <div className="my-5">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="page-title">
                {keyword
                  ? `${jobs.length} Results for ${keyword}`
                  : "Latest Jobs"}
              </h4>
              <Link href="/stats" className="btn btn-secondary stats_btn">
                Get Topic stats
              </Link>
            </div>
            <div className="d-block mt-3">
              <Link href="/search">Go to Search</Link>
            </div>
          </div>

          {jobs && jobs.map((job) => <JobItem key={job.id} job={job} />)}

          {resPerPage < count && (
            <div className="d-flex justify-content-center mt-5">
              <Pagination
                current={page}
                total={count}
                pageSize={resPerPage}
                onChange={handlePageClick}
                showTitle={false}
                className="pagination"
                locale={{
                  prev_page: "Prev",
                  next_page: "Next",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
