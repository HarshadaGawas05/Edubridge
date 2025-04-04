import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Import DataTable dynamically with SSR disabled
const DataTable = dynamic(() => import("react-data-table-component"), {
  ssr: false,
});

const JobCandidates = ({ candidatesApplied }) => {
  const columns = [
    {
      name: "Job Name",
      sortable: true,
      selector: (row) => row.title,
    },
    {
      name: "User ID",
      sortable: true,
      selector: (row) => row.id,
    },
    {
      name: "Candidate Resume",
      sortable: true,
      cell: (row) => (
        <Link
          href={`https://jobbee.s3.amazonaws.com/${row.resume}`}
          passHref
          legacyBehavior
        >
          <a
            className="text-success text-center ml-4"
            rel="noreferrer"
            target="_blank"
          >
            <b>
              <i aria-hidden className="fas fa-download"></i> View Resume
            </b>
          </a>
        </Link>
      ),
    },
    {
      name: "Applied At",
      sortable: true,
      selector: (row) => row.appliedAt.substring(0, 10),
    },
  ];

  const data = candidatesApplied
    ? candidatesApplied.map((item) => ({
        title: item.job.title,
        id: item.user,
        salary: item.salary,
        resume: item.resume,
        appliedAt: item.appliedAt,
      }))
    : [];

  return (
    <div className="row">
      <div className="col-2"></div>
      <div className="col-8 mt-5">
        <h4 className="my-5">
          {candidatesApplied
            ? `${candidatesApplied.length} Candidates applied to this job`
            : "No candidates applied yet"}
        </h4>
        {typeof window !== "undefined" && (
          <DataTable columns={columns} data={data} pagination responsive />
        )}
      </div>
      <div className="col-2"></div>
    </div>
  );
};

export default JobCandidates;
