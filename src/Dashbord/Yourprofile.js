import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; 
import { db } from '../config/Firebase/Firebaseconfiguration'; 

const Yourprofile = () => {
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [newContent, setNewContent] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  const [showLikesDropdown, setShowLikesDropdown] = useState({}); // Track visibility of dropdown per post
  const [likedUsers, setLikedUsers] = useState({}); // To store liked users by postId

  const auth = getAuth();
  const userEmail = auth.currentUser?.email;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userEmail) return;

      try {
        const userRef = doc(db, 'users', auth.currentUser?.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          console.log('No such user!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchUserPosts = async () => {
      if (!userEmail) return;

      try {
        const userPostsRef = doc(db, 'usersprofileposts', userEmail);
        const postsCollection = collection(userPostsRef, 'postss');
        const querySnapshot = await getDocs(postsCollection);

        const posts = [];
        querySnapshot.forEach((doc) => {
          posts.push({ id: doc.id, ...doc.data() });
        });
        setUserPosts(posts);
      } catch (error) {
        console.error('Error fetching user posts:', error);
      }
    };

    fetchUserData();
    fetchUserPosts();
    setLoading(false);
  }, [userEmail]);

  const handleEditPost = (postId, content) => {
    setEditingPostId(postId);
    setNewContent(content);
  };

  const handleSaveEdit = async () => {
    if (!newContent.trim()) return;

    try {
      const postRef = doc(db, 'usersprofileposts', userEmail, 'postss', editingPostId);
      await updateDoc(postRef, { content: newContent });

      const mainPostRef = doc(db, 'posts', editingPostId);
      await updateDoc(mainPostRef, { content: newContent });

      setUserPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === editingPostId ? { ...post, content: newContent } : post
        )
      );

      setEditingPostId(null);
      setNewContent(""); 
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async () => {
    try {
      const postRef = doc(db, 'usersprofileposts', userEmail, 'postss', postIdToDelete);
      await deleteDoc(postRef);

      const mainPostRef = doc(db, 'posts', postIdToDelete);
      await deleteDoc(mainPostRef);

      setUserPosts(prevPosts => prevPosts.filter(post => post.id !== postIdToDelete));

      setShowDeleteModal(false);
      setPostIdToDelete(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const toggleContent = (postId) => {
    setExpandedPostId(prev => (prev === postId ? null : postId));
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Invalid Date';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  const toggleLikesDropdown = (postId) => {
    setShowLikesDropdown((prev) => ({ ...prev, [postId]: !prev[postId] }));
    fetchLikedUsers(postId); // Fetch the liked users when dropdown is toggled
  };

  const fetchLikedUsers = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      const likedByUids = postDoc.data()?.likedBy || [];

      const users = {};
      for (const uid of likedByUids) {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          users[uid] = userDoc.data().username; // Store username by UID
        }
      }
      setLikedUsers((prev) => ({ ...prev, [postId]: users }));
    } catch (error) {
      console.error('Error fetching liked users:', error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-2 ml-[20px] md:ml-[40%]">
      {/* Profile Header */}
      <div className="flex items-center bg-green-700 w-[110%] mt-[40px] md:w-[70%] p-4 rounded shadow-2xl gap-4 mb-6">
        <div className="w-20 h-20 border-2 shadow-2xl border-white rounded-full flex items-center justify-center">
          {userData?.profilePicture ? (
            <img src={userData.profilePicture} alt="Profile" className="w-full h-full rounded-full" />
          ) : (
            <span className="text-3xl text-white">{userData?.username?.[0]?.toUpperCase() || 'A'}</span>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">{userData?.username || 'No Username'}</h2>
          <p className="text-sm text-gray-200">{userData?.email || 'No email available'}</p>
        </div>
      </div>

      {/* User Posts */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Your Posts</h3>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <div key={post.id} className="w-full md:w-[80%] lg:w-[70%] h-auto mb-4 p-6 border rounded-lg shadow-xl bg-white relative">
              {/* Post Content */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center">
                    {userData?.profilePicture ? (
                      <img src={userData.profilePicture} alt="Profile" className="w-full h-full rounded-full" />
                    ) : (
                      <span className="text-xl text-gray-500">{userData?.username?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{userData?.username || 'Anonymous'}</p>
                    <span className="text-xs text-gray-400">{formatDate(post.createdAt)}</span>
                  </div>
                </div>

                {/* Post Content */}
                <div
                  className="w-[100%] p-2 shadow rounded border-2"
                  style={{
                    maxHeight: expandedPostId === post.id ? 'none' : '150px',
                    overflow: 'hidden',
                  }}
                >
                  <p className="w-[100%] text-base text-gray-700 leading-relaxed whitespace-pre-wrap break-words mt-2">
                    {post.content || 'No content available.'}
                  </p>
                </div>
              </div>

              {/* Edit and Delete Buttons */}
              <div className="mt-[10px] flex gap-4">
                <button
                  onClick={() => handleEditPost(post.id, post.content)}
                  className="text-blue-500 text-sm p-2 hover:bg-gray-200 hover:shadow-xl rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => { setShowDeleteModal(true); setPostIdToDelete(post.id); }}
                  className="text-red-500 text-sm p-2 hover:bg-gray-200 hover:shadow-xl rounded"
                >
                  Delete
                </button>
              </div>

              {/* Likes Dropdown Button */}
              <div className="absolute bottom-2 right-2">
                <button
                  onClick={() => toggleLikesDropdown(post.id)}
                  className="text-blue-500 text-sm p-2 hover:bg-gray-200 hover:shadow-xl rounded"
                >
                  {post.likedBy?.length + 1 || 0} Like{(post.likedBy?.length !== 1) && 's'}
                </button>

                {/* Likes List Dropdown */}
                {showLikesDropdown[post.id] && (
                  <div className=" absolute bg-white shadow-lg border rounded-lg p-6 mt-2">
                    <p className="text-gray-800  font-semibold">Liked By:</p>
                    {likedUsers[post.id] ? (
                      Object.values(likedUsers[post.id]).map((username, index) => (
                        <p key={index} className="mt-[10px] text-gray-600">{username}</p>
                      ))
                    ) : (
                      <p className="text-gray-400">Loading...</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>You have no posts yet.</p>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <p>Are you sure you want to delete this post?</p>
            <div className="mt-4">
              <button
                onClick={handleDeletePost}
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Yourprofile;
