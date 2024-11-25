import React, { useState } from 'react';
import { Input, Dropdown, Button, Menu } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const Header = ({ onSearch, menu }) => {
  const [searchPlaceholder, setSearchPlaceholder] = useState('Search');
  const [selectedType, setSelectedType] = useState('students'); // Default to 'students'

  // Handle menu selection
  const handleMenuClick = (e) => {
    const selectedOption = e.key === '1' ? 'students' : 'admin';
    setSelectedType(selectedOption);
    setSearchPlaceholder(`Search ${selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}`);
    onSearch('', selectedOption); // Reset search with the selected type
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    onSearch(searchValue, selectedType);
  };

  // Dropdown menu for selecting type
  const dropdownMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">Students</Menu.Item>
      <Menu.Item key="2">Admin</Menu.Item>
    </Menu>
  );

  return (
    <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-md mb-6">
      <h1 className="text-2xl font-semibold">Students Management</h1>
      <div className="flex items-center space-x-4">
        <Input
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          className="w-64"
          onChange={handleSearchChange}
        />
        <Dropdown overlay={dropdownMenu}>
          <Button>Options</Button>
        </Dropdown>
      </div>
    </div>
  );
};

export default Header;
