import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Form, message, Spin } from 'antd';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const { TextArea } = Input;

function StuApplication() {
  const [activeTab, setActiveTab] = useState('yourApplications');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false); // New state for deleting action
  const [form] = Form.useForm();
  const [applications, setApplications] = useState([]);
  const [applicationLoading, setApplicationLoading] = useState(false);

  const firestore = getFirestore();
  const auth = getAuth();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFormSubmit = async (values) => {
    const user = auth.currentUser;
    if (!user) {
      message.error('You must be logged in to submit an application.');
      return;
    }

    try {
      const appData = {
        ...values,
        email: user.email,
        submittedAt: serverTimestamp(),
        status: 'pending', // Default status is 'pending'
        approved: 'processing', // Default approval status is 'processing'
        uid: user.uid, // Saving the user's UID
      };

      setLoading(true);

      // Save to the applications collection
      const appDocRef = await addDoc(collection(firestore, 'applications'), appData);
      const docId = appDocRef.id;

      // Save to the user's sub-collection of applications
      const userDocRef = doc(firestore, 'your-application', user.uid);
      const subCollectionRef = collection(userDocRef, 'applications');
      const subDocRef = doc(subCollectionRef, docId);

      // Explicitly saving the uid to both collections
      await setDoc(subDocRef, {
        ...appData,
        uid: user.uid, // Explicitly adding the UID
      });

      message.success('Application submitted successfully!');
      setIsModalOpen(false);
      form.resetFields();

      fetchApplications(); // Fetch applications after submission
    } catch (error) {
      console.error('Error submitting application:', error);
      message.error('Failed to submit the application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const fetchApplications = async () => {
    const user = auth.currentUser;
    if (!user) return;
  
    try {
      setApplicationLoading(true);
  
      const userDocRef = doc(firestore, 'your-application', user.uid);
      const subCollectionRef = collection(userDocRef, 'applications');
  
      // Fetch applications with status 'pending' or 'done'
      const q = query(subCollectionRef, where('status', 'in', ['pending', 'done']));
  
      const querySnapshot = await getDocs(q);
      const apps = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      message.error('Failed to fetch applications. Please try again.');
    } finally {
      setApplicationLoading(false);
    }
  };
  
  const handleDeleteApplication = async (applicationId) => {
    const user = auth.currentUser;
    if (!user) return;

    setDeleting(true); // Set deleting state to true

    try {
      // Delete from the 'your-application' collection sub-collection
      const userDocRef = doc(firestore, 'your-application', user.uid);
      const subCollectionRef = collection(userDocRef, 'applications');
      const docRef = doc(subCollectionRef, applicationId);

      await deleteDoc(docRef);
      message.success('Application deleted successfully!');
      fetchApplications(); // Refresh the applications after deletion
    } catch (error) {
      console.error('Error deleting application:', error);
      message.error('Failed to delete the application. Please try again.');
    } finally {
      setDeleting(false); // Reset deleting state
    }
  };

  const showDeleteConfirmation = (applicationId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this application?',
      onOk: () => handleDeleteApplication(applicationId),
      onCancel() {
        console.log('Delete cancelled');
      },
      okText: 'Yes',
      cancelText: 'No',
      okButtonProps: { loading: deleting }, // Show loading spinner on 'Yes' button
    });
  };

  useEffect(() => {
    if (activeTab === 'yourApplications') {
      fetchApplications();
    }
  }, [activeTab]);

  return (
    <div className="p-4 max-h-[795px]  overflow-y-auto scrollbar-hide w-[100%] ">
      {/* Navigation */}
      <nav className="flex fixed  mb-6">
        <button
          className={`px-4 py-2 shadow-xl  rounded-md mr-2 ${activeTab === 'yourApplications' ? 'font-bold bg-blue-500 text-white shadow-blue-500 ' :'bg-gray-200 text-gray-700  shadow-gray-500 '}`}
          onClick={() => handleTabChange('yourApplications')}
        >
          Your Applications
        </button>
        <button
          className={`px-4 py-2 shadow-xl  rounded-md ${activeTab === 'writeApplication' ? 'font-bold bg-blue-500 text-white  shadow-blue-500 ' : 'bg-gray-200 text-gray-700  shadow-gray-500 '}`}
          onClick={() => handleTabChange('writeApplication')}
        >
          Write Application
        </button>
      </nav>

      {/* Content */}
      <div className=" p-6 mt-[70px] rounded-md">
        {activeTab === 'yourApplications' && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Your Applications</h1>
            {applicationLoading ? (
              <div className="flex  justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : applications.length === 0 ? (
              <p>No applications available at the moment.</p>
            ) : (
              <div className="">
              {applications.map((item) => (
                <div
                  key={item.id}
                  className={`m-[20px]  rounded-xl border-2 p-2 ${
                    item.approved === 'processing'
                      ? 'border-yellow-500 shadow-xl shadow-yellow-200' 
                      : item.approved === 'rejected'
                      ? 'border-red-500 shadow-xl shadow-red-200'
                      : 'border-green-500 shadow-xl shadow-green-200'
                  }`}
                >
                  {/* Application data display */}
                  <div className="flex justify-between mt-[10px]">
                    <div className="text-sm text-gray-600">{item.email}</div>
                    <div
                      className={`text-sm ${
                        item.approved === 'approved'
                          ? 'text-green-500 '
                          : item.approved === 'rejected'
                          ? 'text-red-500'
                          : 'text-yellow-500'
                      }`}
                    >
                      {item.approved === 'approved'
                        ? 'Approved'
                        : item.approved === 'rejected'
                        ? 'Rejected'
                        : 'Processing'}
                    </div>
                  </div>
                  <div className="mt-1 text-xl">
                    <strong>{item.to},</strong>
                  </div>
                  <div className="mt-1 text-xl" >
                    {item.principal},
                  </div>
                  <div className="mt-1 text-xl">
                    {item.schoolName},
                  </div>
                  <div className="mt-1 text-xl">
                    {item.city},
                  </div>
                  <div className="mt-2 text-xl">
                  Subject: <strong>{item.subject}</strong> 
                  </div>
                  <div className="mt-5">
                    <div className="break-words whitespace-normal text-[15px] ml-[90px]">{item.body}</div>
                  </div>
                  <div className="text-xl mt-5">{item.applicantname}</div>
                  <div className="mt-1 text-xl">{item.class}</div>
            
                  {/* Conditional rendering of the delete button */}
                  {item.approved === 'processing' && (
                    <div className="mt-4 flex justify-end">
                      <Button type="danger" className='text-[red]' onClick={() => showDeleteConfirmation(item.id)}>
                        Delete Application
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'writeApplication' && (
          <div>
            <h1 className="text-2xl font-bold mb-4">Write Application</h1>
           
           
        
              <Form
                form={form}
                onFinish={handleFormSubmit}
                layout="vertical"
                className="space-y-4"
              >
                <Form.Item
                  name="to"
                  label="To"
                  rules={[{ required: true, message: 'Please input the recipient!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="principal"
                  label="Principal's Name"
                  rules={[{ required: true, message: 'Please input the principal\'s name!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="schoolName"
                  label="School Name"
                  rules={[{ required: true, message: 'Please input the school name!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, message: 'Please input the city!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message: 'Please input the subject!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="body"
                  label="Body"
                  rules={[{ required: true, message: 'Please input the body of the application!' }]}
                >
                  <TextArea rows={6} />
                </Form.Item>
                <Form.Item
                  name="applicantname"
                  label="Applicant's Name"
                  rules={[{ required: true, message: 'Please input your name!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="class"
                  label="Class"
                  rules={[{ required: true, message: 'Please input your class!' }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" onClick={handleOk} loading={loading}>
                    Submit
                  </Button>
                </Form.Item>
              </Form>
          </div>
        )}
      </div>
    </div>
  );
}

export default StuApplication;
