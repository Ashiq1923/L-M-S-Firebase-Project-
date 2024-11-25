import React from 'react';
import { Modal } from 'antd';

function ResultsModal({ visible, onCancel, studentResults }) {
  return (
    <Modal
      title="Student Results"
      visible={visible}
      onCancel={onCancel}
      footer={null}
    >
      <div>
        {studentResults.length > 0 ? (
          studentResults.map((result, index) => (
            <div key={index} className="mb-4">
              <div><strong>Test Name:</strong> {result.testName}</div>
              <div><strong>Total Marks:</strong> {result.totalMarks}</div>
              <div><strong>Obtained Marks:</strong> {result.marks}</div>
              <div><strong>Date:</strong> {new Date(result.date.seconds * 1000).toLocaleString()}</div>
              <hr className="my-4" />
            </div>
          ))
        ) : (
          <p>No results available for this student.</p>
        )}
      </div>
    </Modal>
  );
}

export default ResultsModal;
