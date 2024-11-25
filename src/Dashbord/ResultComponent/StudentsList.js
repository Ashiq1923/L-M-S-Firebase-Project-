import React from 'react';
import { Table, Spin } from 'antd';

function StudentsList({ students, loadingStudents, columns }) {
  return (
    <div>
      {loadingStudents ? (
        <Spin size="large" />
      ) : (
        <Table
          dataSource={students}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      )}
    </div>
  );
}

export default StudentsList;
