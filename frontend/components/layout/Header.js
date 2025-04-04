import React, { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import AuthContext from "../../context/AuthContext";

const Header = () => {
  const { loading, user, logout } = useContext(AuthContext);

  const logoutHandler = () => {
    logout();
  };

  return (
    <div className="navWrapper">
      <div className="navContainer">
        <Link href="/">
          <div className="logoWrapper">
            <div className="logoImgWrapper">
              <Image width="50" height="50" src="/images/logo.png" alt="" />
            </div>
            <span className="logo1">Job</span>
            <span className="logo2">bee</span>
          </div>
        </Link>
        <div className="btnsWrapper">
          <Link href="/employeer/jobs/new">
            <button className="postAJobButton">
              <span>Post A Job</span>
            </button>
          </Link>
          <Link href="/courses/new">
            <button className="postACourseButton">
              <span>Post A Course</span>
            </button>
          </Link>
          {user ? (
            <div className="dropdown ml-3">
              <button
                className="btn dropdown-toggle mr-4"
                id="dropDownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span>Hi, {user?.first_name || "User"}</span>
              </button>
              <div
                className="dropdown-menu"
                aria-labelledby="dropDownMenuButton"
              >
                <Link href="/employeer/jobs" className="dropdown-item">
                  My Jobs
                </Link>
                <Link href="/courses" className="dropdown-item">
                  Browse Courses
                </Link>
                <Link href="/me/courses" className="dropdown-item">
                  My Learning
                </Link>
                <Link href="/me/applied" className="dropdown-item">
                  Jobs Applied
                </Link>
                <Link href="/me" className="dropdown-item">
                  Profile
                </Link>
                <Link href="/upload/resume" className="dropdown-item">
                  Upload Resume
                </Link>
                <button
                  className="dropdown-item text-danger"
                  onClick={logoutHandler}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            !loading && (
              <Link href="/login">
                <button className="loginButtonHeader">
                  <span>Login</span>
                </button>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
