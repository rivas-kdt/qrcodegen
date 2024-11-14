// components/Post.js
import React from 'react';
import { useParams } from 'react-router-dom';

function Post() {
  // Get the post ID from the URL
  const { id } = useParams();

  return (
    <div>
      <h2>Post {id}</h2>
      <p>This is the content of post {id}.</p>
    </div>
  );
}

export default Post;