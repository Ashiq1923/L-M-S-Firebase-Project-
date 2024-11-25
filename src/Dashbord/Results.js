import React, { useState, useEffect } from 'react';
import { notification } from 'antd';
import { db, collection, getDocs, doc, addDoc } from '../config/firebase/firebaseconfig';
import { Button } from 'antd';
import CourseButtons from './ResultComponent/CourseButtons';
import StudentsList from './ResultComponent/StudentsList';
import ResultModal from './ResultComponent/ResultModal';
import ResultsModal from './ResultComponent/ResultsModal';

function Results() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [marks, setMarks] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [testName, setTestName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAddResultModalVisible, setIsAddResultModalVisible] = useState(false);
  const [isSeeResultModalVisible, setIsSeeResultModalVisible] = useState(false);

  // Fetch courses from Firestore on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseCollection = collection(db, 'courses');
        const courseSnapshot = await getDocs(courseCollection);
        const courseList = courseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(courseList);
        setLoadingCourses(false);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setLoadingCourses(false);
        notification.error({
          message: 'Error',
          description: 'Could not fetch courses. Please try again later.',
        });
      }
    };

    fetchCourses();
  }, []);

  // Fetch students when the selected course changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedCourse) {
        setLoadingStudents(true);
        try {
          const studentCollection = collection(db, 'student');
          const studentSnapshot = await getDocs(studentCollection);
          const studentList = studentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

          // Filter students based on the selected course
          const filteredStudents = studentList.filter(student => student.course === selectedCourse.name);
          setStudents(filteredStudents);
        } catch (error) {
          console.error('Error fetching students:', error);
          notification.error({
            message: 'Error',
            description: 'Could not fetch students. Please try again later.',
          });
        }
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [selectedCourse]);

  // Handle course button click
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
  };

  // Fetch results for a specific student
  const fetchStudentResults = async (studentCnic) => {
    try {
      const resultsRef = collection(db, 'results', studentCnic, 'results');
      const resultSnapshot = await getDocs(resultsRef);
      const resultsList = resultSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudentResults(resultsList);
    } catch (error) {
      console.error('Error fetching student results:', error);
      notification.error({
        message: 'Error',
        description: 'Could not fetch student results. Please try again later.',
      });
    }
  };

  // Handle result submission for a student
  const handleSubmitResult = async () => {
    if (!marks || !totalMarks || !testName) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const resultData = {
        marks,
        totalMarks,
        testName,
        studentId: selectedStudent.id,
        date: new Date(),
      };

      const studentRef = doc(db, 'results', selectedStudent.cnic);
      const resultsSubcollectionRef = collection(studentRef, 'results');
      await addDoc(resultsSubcollectionRef, resultData);

      notification.success({
        message: 'Success',
        description: 'Result saved successfully',
      });

      setIsAddResultModalVisible(false); // Close modal
    } catch (error) {
      console.error('Error saving result:', error);
      notification.error({
        message: 'Error',
        description: 'Error saving result. Please try again later.',
      });
    }

    setIsLoading(false);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Father\'s Name',
      dataIndex: 'fatherName',
      key: 'fatherName',
    },
    {
      title: 'CNIC',
      dataIndex: 'cnic',
      key: 'cnic',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
    },
    {
      title: 'Results',
      key: 'results',
      render: (text, student) => (
        <Button
          type="default"
          onClick={() => {
            fetchStudentResults(student.cnic);
            setSelectedStudent(student);
            setIsSeeResultModalVisible(true);
          }}
        >
          See Results
        </Button>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, student) => (
        <Button
          type="primary"
          onClick={() => {
            setSelectedStudent(student);
            setIsAddResultModalVisible(true);
          }}
        >
          Add Result
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Results</h2>

      {/* Course Selection */}
      <CourseButtons
        courses={courses}
        loadingCourses={loadingCourses}
        selectedCourse={selectedCourse}
        onCourseClick={handleCourseClick}
      />

      {/* Students List */}
      {selectedCourse ? (
        <div>
          <h3 className="text-2xl font-bold mb-4">{selectedCourse.name} - Students</h3>
          <StudentsList
            students={students}
            loadingStudents={loadingStudents}
            columns={columns}
          />
        </div>
      ) : (
        <p className="text-center text-gray-500">Select a course to view details.</p>
      )}

      {/* Modal for Adding Results */}
      <ResultModal
        visible={isAddResultModalVisible}
        onCancel={() => setIsAddResultModalVisible(false)}
        onSubmit={handleSubmitResult}
        isLoading={isLoading}
        marks={marks}
        totalMarks={totalMarks}
        testName={testName}
        setMarks={setMarks}
        setTotalMarks={setTotalMarks}
        setTestName={setTestName}
      />

      {/* Modal for Viewing Results */}
      <ResultsModal
        visible={isSeeResultModalVisible}
        onCancel={() => setIsSeeResultModalVisible(false)}
        studentResults={studentResults}
      />
    </div>
  );
}

export default Results;
