import React, { useEffect, useContext } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import JobContext from "../../context/JobContext";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

// Import DataTable dynamically with SSR disabled
const DataTable = dynamic(() => import("react-data-table-component"), {
  ssr: false,
});

const MyJobs = ({ jobs, access_token }) => {
  const { clearErrors, error, loading, deleted, deleteJob, setDeleted } =
    useContext(JobContext);

  const router = useRouter();

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearErrors();
    }

    if (deleted) {
      setDeleted(false);
      router.push(router.asPath);
    }
  }, [error, deleted]);

  const deleteJobHandler = (id) => {
    deleteJob(id, access_token);
  };

  const columns = [
    {
      name: "Job ID",
      sortable: true,
      selector: (row) => row.id,
    },
    {
      name: "Job name",
      sortable: true,
      selector: (row) => row.title,
    },
    {
      name: "Salary",
      sortable: true,
      selector: (row) => row.salary,
    },
    {
      name: "Action",
      sortable: false,
      cell: (row) => (
        <div className="d-flex gap-2">
          <Link href={`/jobs/${row.id}`} className="btn btn-primary my-2">
            <i aria-hidden className="fa fa-eye"></i>
          </Link>

          <Link
            href={`/employeer/jobs/candidates/${row.id}`}
            className="btn btn-success my-2"
          >
            <i aria-hidden className="fa fa-users"></i>
          </Link>

          <Link
            href={`/employeer/jobs/${row.id}`}
            className="btn btn-warning my-2"
          >
            <i aria-hidden className="fa fa-pencil"></i>
          </Link>

          <button
            className="btn btn-danger my-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteJobHandler(row.id);
            }}
          >
            <i className="fa fa-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  const data =
    jobs?.map((job) => ({
      id: job.id,
      title: job.title,
      salary: job.salary,
    })) || [];

  return (
    <div className="row">
      <div className="col-2"></div>
      <div className="col-8 mt-5">
        <h4 className="my-5">My Jobs</h4>
        {typeof window !== "undefined" && (
          <DataTable
            columns={columns}
            data={data}
            pagination
            responsive
            persistTableHead
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30]}
            noDataComponent="No jobs found"
          />
        )}
      </div>
      <div className="col-2"></div>
    </div>
  );
};

export default MyJobs;
