import React from 'react';
import { Modal, Input, Button } from 'antd';

function ResultModal({ visible, onCancel, onSubmit, isLoading, marks, totalMarks, testName, setMarks, setTotalMarks, setTestName }) {
  return (
    <Modal
      title="Add Result"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      confirmLoading={isLoading}
    >
      <div>
        <Input
          type="number"
          placeholder="Marks"
          value={marks}
          onChange={(e) => setMarks(e.target.value)}
          className="mb-3"
        />
        <Input
          type="number"
          placeholder="Total Marks"
          value={totalMarks}
          onChange={(e) => setTotalMarks(e.target.value)}
          className="mb-3"
        />
        <Input
          type="text"
          placeholder="Test Name"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          className="mb-3"
        />
        <Button
          type="primary"
          onClick={onSubmit}
          loading={isLoading}
          className="w-full"
        >
          Save Result
        </Button>
      </div>
    </Modal>
  );
}

export default ResultModal;
