import React from 'react';
import { Button, Spin } from 'antd';

function CourseButtons({ courses, loadingCourses, selectedCourse, onCourseClick }) {
  return (
    <div className="flex gap-4 flex-wrap mb-6">
      {loadingCourses ? (
        <Spin size="large" />
      ) : (
        courses.map(course => (
          <div
            key={course.id}
            className="relative"
            onClick={() => onCourseClick(course)} // Handle course selection
          >
            <Button
              className={`px-4 py-2 rounded transition-all relative mb-[10px] ${
                selectedCourse && selectedCourse.id === course.id ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
              }`}
            >
              {course.name}
            </Button>
            {selectedCourse && selectedCourse.id === course.id && (
              <div
                className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-700 transform transition-all"
                style={{
                  width: '100%',
                  transform: 'scaleX(1)',
                  transformOrigin: 'bottom left',
                  transition: 'transform 0.3s ease-in-out',
                }}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default CourseButtons;
