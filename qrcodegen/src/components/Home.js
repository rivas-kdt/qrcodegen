// Home.js
import React, { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react"; // Import the QRCode component
import { v4 as uuidv4 } from "uuid";

function Home() {
  const [data, setData] = useState([]);
  const [uploadInfo, setUploadInfo] = useState(null); 
  const [hasPhoto, setHasPhoto] = useState(false);
  const videoRef = useRef(null);
  const photoRef = useRef(null);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/getData");
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setData(data.posts); // Store the posts data from the API
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Failed to fetch posts"); // Show an alert if fetching fails
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []); // Fetch posts on component mount

  return (
    <div className="App">
      <header className="App-header">
        <h1>Take a Photo and Upload</h1>
        <div>
          <video ref={videoRef} style={{ width: 600 }} />
          <button onClick={takePhoto}>SNAP!</button>
        </div>

        {data.length > 0 && (
          <div>
            <h3>Posts from Database:</h3>
            <ul>
              {data.map((post) => (
                <li key={post.uuid}>{post.title} - {post.likes} likes</li>
              ))}
            </ul>
          </div>
        )}

        {uploadInfo && (
          <div>
            <h3>Scan the QR Code to Access the Photo:</h3>
            <QRCodeSVG value={uploadInfo.url} size={256} />
          </div>
        )}
      </header>
    </div>
  );
}

export default Home;
