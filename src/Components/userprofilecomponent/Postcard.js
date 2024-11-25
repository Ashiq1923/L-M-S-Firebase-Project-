import React from 'react';

function PostCard({ post, currentUser, handleLike, toggleContent, expandedPostId }) {
  const isLiked = post.likedBy && post.likedBy.includes(currentUser?.uid);

  return (
    <div key={post.id} className="mb-[20px] md:mb-4 border-b pb-4">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center mr-3">
          {post.username ? post.username[0].toUpperCase() : 'U'}
        </div>
        <div>
          <p className="font-bold">{post.username}</p>
          <p className="text-sm text-gray-500">{post.createdAt}</p>
        </div>
      </div>

      <div
        className="mb-3 border rounded p-2 w-full max-h-[150px] overflow-hidden"
        style={{
          maxHeight: expandedPostId === post.id ? 'none' : '150px',
        }}
      >
        <p className="text-base w-[100%] h-[150px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      {post.content && post.content.length > 150 && (
        <button
          onClick={() => toggleContent(post.id)}
          className="text-blue-500 text-sm mt-2"
        >
          {expandedPostId === post.id ? 'See Less' : 'See More'}
        </button>
      )}

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => handleLike(post.id, isLiked)}
          className={`p-2 rounded ${isLiked ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'} text-white`}
        >
          {isLiked ? 'Unlike' : 'Like'}
        </button>
        <span>{post.likedBy ? post.likedBy.length : 0} Likes</span>
      </div>
    </div>
  );
}

export default PostCard;
