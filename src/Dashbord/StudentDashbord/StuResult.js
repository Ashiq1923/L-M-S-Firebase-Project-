import React, { useState } from 'react';
import { db } from '../../config/firebase/firebaseconfig'; // Ensure to import db from your Firebase config
import { collection, query, getDocs } from 'firebase/firestore';
import { Button, Input, Spin, Alert, Card } from 'antd'; // Import Ant Design components
import { UserOutlined } from '@ant-design/icons'; // For icon in input field

const StuResult = () => {
  const [cnic, setCnic] = useState(''); // Store CNIC entered by the user
  const [results, setResults] = useState([]); // Store fetched result data as an array
  const [loading, setLoading] = useState(false); // Show loader while fetching data
  const [error, setError] = useState(null); // Store error message, if any
  const [showInput, setShowInput] = useState(true); // To toggle the CNIC input field visibility

  // Function to fetch result data from Firestore based on CNIC
  const fetchResults = async () => {
    if (cnic.length !== 13) {
      setError('CNIC must be 13 digits');
      return;
    }

    setLoading(true);
    setError(null); // Reset error before fetching data
    setResults([]); // Reset results to avoid old data being shown

    try {
      // Path to fetch the result subcollection using the student's CNIC
      const resultsRef = collection(db, `results/${cnic}/results`); // Accessing subcollection 'results' within document {cnic}
      const q = query(resultsRef);
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // If data is found in the subcollection, get it
        const data = querySnapshot.docs.map((doc) => doc.data());
        setResults(data); // Set the array of results
        setShowInput(false); // Hide CNIC input field once data is fetched
      } else {
        setError('No results found for this CNIC.');
      }
    } catch (err) {
      setError('Error fetching result data.');
    } finally {
      setLoading(false);
    }
  };

  // Sort results in descending order based on the timestamp (latest first)
  const sortedResults = results.sort((a, b) => b.date.seconds - a.date.seconds);

  return (
    <div className="max-w-[100%] mx-auto p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Test Results</h2>

      {showInput && (
        <div className="flex flex-col items-center mb-6">
          <Input
            className="mb-4"
            placeholder="Enter CNIC"
            maxLength={13}
            value={cnic}
            onChange={(e) => setCnic(e.target.value)}
            prefix={<UserOutlined />}
            size="large"
          />
          <Button
            type="primary"
            size="large"
            onClick={fetchResults}
            disabled={loading}
            loading={loading}
            className="w-full"
          >
            OK
          </Button>
        </div>
      )}

      {error && (
        <div className="mb-6">
          <Alert message={error} type="error" showIcon />
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center">
          <Spin size="large" />
        </div>
      )}

      {results.length > 0 && !loading && (
        <div className="space-y-4 overflow-auto max-h-[700px]">

          {sortedResults.map((result, index) => (
            <Card key={index} className="mb-4">
              <div><strong>Test Name:</strong> {result.testName || 'N/A'}</div>
              <div><strong>Marks:</strong> {result.marks || 'N/A'}</div>
              <div><strong>Total Marks:</strong> {result.totalMarks || 'N/A'}</div>
              <div><strong>Date:</strong> {new Date(result.date.seconds * 1000).toLocaleString() || 'N/A'}</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StuResult;
