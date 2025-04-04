import React, { useState } from "react";
import CourseItem from "./CourseItem";

const CourseList = ({ courses: initialCourses, access_token }) => {
  const [courses, setCourses] = useState(initialCourses);

  const handleDelete = (deletedCourseId) => {
    setCourses(courses.filter((course) => course.id !== deletedCourseId));
  };

  if (!courses || courses.length === 0) {
    return (
      <div className="alert alert-info">
        No courses available at the moment.
      </div>
    );
  }

  return (
    <div className="row">
      {courses.map((course) => (
        <div key={course.id} className="col-lg-4 col-md-6 mb-4">
          <CourseItem
            course={course}
            access_token={access_token}
            onDelete={handleDelete}
          />
        </div>
      ))}
    </div>
  );
};

export default CourseList;
