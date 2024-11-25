import React, { useState, useEffect } from 'react';
import { db, auth } from '../../config/Firebase/Firebaseconfiguration';
import { collection, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const AddPostPopup = ({ setShowPopup, onPostAdded }) => {
  const [postContent, setPostContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [message, setMessage] = useState(''); // State for message notifications

  const getFormattedDate = () => {
    const date = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;

      if (!user) {
        setMessage('You must be logged in to post');
        setUserDataLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        } else {
          setMessage('User data not found!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage('Failed to fetch user data');
      } finally {
        setUserDataLoading(false);
        setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
      }
    };

    fetchUserData();
  }, []);

  const handleSavePost = async () => {
    if (!postContent.trim()) {
      setMessage('Post content cannot be empty');
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;

      if (!user) {
        setMessage('You must be logged in to post');
        setLoading(false);
        setTimeout(() => setMessage(''), 3000);
        return;
      }

      const newPostId = doc(collection(db, 'posts')).id;

      const postData = {
        username: username,
        email: user.email,
        uid: user.uid,
        content: postContent,
        timestamp: serverTimestamp(),
        createdAt: getFormattedDate(),
      };

      const postsCollectionRef = doc(db, 'posts', newPostId);
      await setDoc(postsCollectionRef, postData);

      const userProfilePostRef = doc(db, 'usersprofileposts', user.email);
      const userPostsSubcollectionRef = doc(userProfilePostRef, 'postss', newPostId);
      await setDoc(userPostsSubcollectionRef, postData);

      setMessage('Post added successfully');
      setShowPopup(false);

      if (onPostAdded) {
        onPostAdded(postData); // Notify the parent component
      }
    } catch (error) {
      console.error('Error adding post:', error);
      setMessage('Failed to add post');
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="w-full fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 md:w-1/3 rounded">
        <h2 className="text-xl mb-4">Add a Post</h2>

        {/* Display message notification */}
        {message && (
          <div className="bg-blue-500 text-white p-2 rounded mb-4 text-center">
            {message}
          </div>
        )}

        {userDataLoading ? (
          <div>Loading user data...</div>
        ) : (
          <>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="w-full p-2 border-2 mb-4"
              placeholder="Write something..."
            />
            <div className="flex justify-end">
              <button
                onClick={handleSavePost}
                className="bg-blue-500 text-white p-2 rounded mr-2"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-gray-300 p-2 rounded"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddPostPopup;
