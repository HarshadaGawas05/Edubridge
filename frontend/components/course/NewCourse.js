import React, { useState, useContext } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { toast } from "react-toastify";
import { CourseLevel, Industry } from "../../utils/constants";
import JobContext from "../../context/JobContext";
import axios from "axios";

const NewCourse = ({ access_token }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [level, setLevel] = useState(CourseLevel.BEGINNER);
  const [industry, setIndustry] = useState(Industry.Business);
  const [skills, setSkills] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(1);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const router = useRouter();
  const { clearErrors, error, loading, createCourse } = useContext(JobContext);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const skillsArray = skills.split(",").map((skill) => skill.trim());

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("instructor", instructor);
    formData.append("level", level);
    formData.append("industry", industry);
    formData.append("skills", JSON.stringify(skillsArray));
    formData.append("duration_weeks", durationWeeks);
    formData.append("video_url", videoUrl);
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/courses/new/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Course created successfully!");
      router.push(`/courses/${res.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create course");
    }
  };

  return (
    <div className="newJobcontainer">
      <div className="formWrapper">
        <div className="headerWrapper">
          <div className="headerLogoWrapper">
            <Image src="/images/logo.png" height="70" width="70" alt="Jobbee" />
          </div>
          <h1>
            <i aria-hidden className="fas fa-pencil-alt"></i> POST A COURSE
          </h1>
        </div>

        <form className="form" onSubmit={submitHandler}>
          <div className="row">
            <div className="col-12 col-md-6">
              <div className="inputWrapper">
                <div className="inputBox">
                  <i aria-hidden className="fas fa-heading"></i>
                  <input
                    type="text"
                    placeholder="Course Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="inputBox">
                  <i aria-hidden className="fas fa-user"></i>
                  <input
                    type="text"
                    placeholder="Instructor Name"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    required
                  />
                </div>

                <div className="inputBox">
                  <i aria-hidden className="fas fa-layer-group"></i>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    required
                  >
                    {Object.values(CourseLevel).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inputBox">
                  <i aria-hidden className="fas fa-industry"></i>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    required
                  >
                    {Object.values(Industry).map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-6">
              <div className="inputWrapper">
                <div className="inputBox">
                  <i aria-hidden className="fas fa-clock"></i>
                  <input
                    type="number"
                    placeholder="Duration (weeks)"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(e.target.value)}
                    required
                  />
                </div>

                <div className="inputBox">
                  <i aria-hidden className="fas fa-tools"></i>
                  <input
                    type="text"
                    placeholder="Skills (comma separated)"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    required
                  />
                </div>

                <div className="inputBox">
                  <i aria-hidden className="fab fa-youtube"></i>
                  <input
                    type="url"
                    placeholder="YouTube Video URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="inputBox">
                  <i aria-hidden className="fas fa-image"></i>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="form-control"
                    id="thumbnail"
                  />
                </div>

                {thumbnailPreview && (
                  <div className="image-preview mt-3">
                    <img
                      src={thumbnailPreview}
                      alt="Course thumbnail preview"
                      style={{ maxWidth: "200px", height: "auto" }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="col-12">
              <div className="inputBox">
                <i aria-hidden className="fas fa-file-alt"></i>
                <textarea
                  className="description"
                  placeholder="Course Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="buttonWrapper">
            <button type="submit" className="submitButton">
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCourse;
