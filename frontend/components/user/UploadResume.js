import React, { useState, useContext, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

import AuthContext from "../../context/AuthContext";
import { toast } from "react-toastify";

const UploadResume = ({ access_token }) => {
  const [resume, setResume] = useState(null);

  const router = useRouter();

  const {
    loading,
    user,
    uploaded,
    error,
    clearErrors,
    uploadResume,
    setUploaded,
  } = useContext(AuthContext);

  useEffect(() => {
    if (error) {
      console.error("Error:", error); // Debug error state
      toast.error(error);
      clearErrors();
    }

    if (uploaded) {
      console.log("Resume upload successful!"); // Debug success upload state
      setUploaded(false);
      toast.success("Your resume is uploaded successfully.");
    }
  }, [error, uploaded]);

  const submitHandler = (e) => {
    e.preventDefault();
    console.log("Submitting the form..."); // Debug form submission

    const formData = new FormData();
    formData.append("resume", resume);

    console.log("FormData object:", formData.get("resume")); // Debug FormData content
    uploadResume(formData, access_token);
  };

  const onChange = (e) => {
    setResume(e.target.files[0]);
    console.log("Selected file:", e.target.files[0]); // Debug file selection
  };

  return (
    <div className="modalMask">
      <div className="modalWrapper">
        <div className="left">
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <Image
              src="/images/resume-upload.svg"
              alt="resume"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
        <div className="right">
          <div className="rightContentWrapper">
            <div className="headerWrapper">
              <h3> UPLOAD RESUME </h3>
            </div>
            <form className="form" onSubmit={submitHandler}>
              <div className="inputWrapper">
                <div className="inputBox">
                  <i aria-hidden className="fas fa-upload"></i>
                  <input
                    type="file"
                    name="resume"
                    id="customFile"
                    accept="application/pdf"
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              {/* Update the Link component section */}
              {user && user.resume && (
                <>
                  <h4 className="text-center my-3">OR</h4>
                  <Link href={user.resume} passHref>
                    <div
                      className="text-success text-center ml-4"
                      rel="noopener noreferrer" // Added security best practice
                      target="_blank"
                      style={{
                        cursor: "pointer",
                        display: "block",
                        textAlign: "center",
                      }}
                      onClick={(e) => {
                        // Add error handling for the link
                        if (!user.resume.startsWith("https://")) {
                          e.preventDefault();
                          toast.error("Invalid resume URL");
                        }
                      }}
                    >
                      <i aria-hidden className="fas fa-download"></i> Download
                      Your Resume
                    </div>
                  </Link>
                </>
              )}
              <div className="uploadButtonWrapper">
                <button type="submit" className="uploadButton">
                  {loading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
