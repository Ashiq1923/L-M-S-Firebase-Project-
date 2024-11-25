import React, { useEffect, useState } from 'react';
import { db } from '../config/Firebase/Firebaseconfiguration'; // Firebase configuration
import { doc, getDoc, collection, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom'; // useParams and useNavigate for routing
import { getAuth } from 'firebase/auth';
import ProfileHeader from '../Components/userprofilecomponent/Profileheader';
import PostCard from '../Components/userprofilecomponent/Postcard';

function Userprofile() {
  const { id } = useParams(); // Get the user ID from the URL
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]); // State to hold the posts
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedPostId, setExpandedPostId] = useState(null); // For toggling post content expansion
  const navigate = useNavigate(); // Initialize navigate function
  const auth = getAuth();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = doc(db, 'users', id); // Get user document based on the user ID
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setUserData(docSnap.data()); // Set user data
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [id]);

  // Fetch user posts with real-time updates using onSnapshot
  useEffect(() => {
    setCurrentUser(auth.currentUser); // Set the current logged-in user

    const fetchUserPosts = () => {
      if (userData?.email) {
        const postsCollection = collection(db, 'usersprofileposts', userData.email, 'postss');
        // Real-time updates using onSnapshot
        const unsubscribe = onSnapshot(postsCollection, (postSnapshot) => {
          const postsList = postSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUserPosts(postsList); // Set the posts data
        });

        // Cleanup the listener when the component unmounts or the user changes
        return () => unsubscribe();
      }
    };

    if (userData?.email) {
      fetchUserPosts();
    }
  }, [userData, auth]);

  // Handle like/unlike functionality
  const handleLike = async (postId, isLiked) => {
    const globalPostRef = doc(db, 'posts', postId); // Reference to the global posts collection
    const userProfilePostRef = doc(db, 'usersprofileposts', userData.email, 'postss', postId); // Reference to the user's profile post in postss subcollection

    try {
      if (isLiked) {
        // If the post is liked, remove the user from the likedBy array in the global post and user profile post
        await updateDoc(globalPostRef, {
          likedBy: arrayRemove(currentUser.uid),
        });

        // Remove the post from the user's profile post collection when unliking
        await updateDoc(userProfilePostRef, {
          likedBy: arrayRemove(currentUser.uid),
        });

        // Optionally, if you want to track liked posts in the user profile document, you can remove it from an array in the user profile:
        await updateDoc(doc(db, 'users', userData.email), {
          likedPosts: arrayRemove(postId),
        });

      } else {
        // If the post is not liked, add the user to the likedBy array in the global post and user profile post
        await updateDoc(globalPostRef, {
          likedBy: arrayUnion(currentUser.uid),
        });

        // Add the post to the user's profile post collection when liking
        await updateDoc(userProfilePostRef, {
          likedBy: arrayUnion(currentUser.uid),
        });

        // Optionally, if you want to track liked posts in the user profile document, you can add it to an array in the user profile:
        await updateDoc(doc(db, 'users', userData.email), {
          likedPosts: arrayUnion(postId),
        });
      }
    } catch (error) {
      console.error('Error updating like status:', error);
    }
  };

  // Toggle post content visibility (See More / See Less)
  const toggleContent = (postId) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  };

  return (
    <div className="flex flex-col items-center p-6 md:ml-[40%] w-[120%] md:w-[70%]">
      {/* Back Button */}
      <div className="w-[70%] md:ml-[10%] fixed top-[70px] left-[87%] md:left-[10%] md:top-[20px]">
        <button
          onClick={() => navigate('/Allprofile')} // Navigate to Allprofile
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <span className="text-5xl font-bold md:block hidden">←</span> {/* Left arrow */}
        </button>
      </div>

      {/* Profile Header */}
      {userData && <ProfileHeader userData={userData} navigate={navigate} />}

      <h3 className="text-lg font-semibold mb-2">Posts</h3>

      {/* User Posts */}
      <div className="w-[100%] mb-[10px] md:w-[70%] mt-6 p-4 rounded shadow-xl bg-white">
        {userPosts.length === 0 ? (
          <p className="text-gray-600">No posts available.</p>
        ) : (
          userPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUser={currentUser}
              handleLike={handleLike}
              toggleContent={toggleContent}
              expandedPostId={expandedPostId}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Userprofile;
