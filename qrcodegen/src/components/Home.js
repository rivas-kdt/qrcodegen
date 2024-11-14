// Home.js
import React, { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { QRCodeSVG } from "qrcode.react"; // Import the QRCode component

function Home() {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null); // To store upload metadata

  // Get video stream from webcam
  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: { width: 600, height: 360 } })
      .then((stream) => {
        let video = videoRef.current;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });
  };

  // Upload photo to Vercel serverless function
  const uploadPhoto = async (file, uuid) => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("uuid", uuid); // Send UUID along with the image

    try {
      // Update the URL to point to your deployed Vercel function
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      // Check if the response is successful
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error");
      }

      // If upload is successful, parse the JSON response
      const result = await response.json();
      console.log("Upload successful:", result);

      // Set metadata for the uploaded file
      setUploadInfo({
        uuid: result.uuid,
        url: result.url,
      });

      alert("Photo uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error.message);
      alert("Upload failed: " + error.message);
    }
  };

  const takePhoto = () => {
    const width = 414;
    const height = width / (16 / 9);
    let video = videoRef.current;
    let photo = photoRef.current;
    let ctx = photo.getContext("2d");

    photo.width = width;
    photo.height = height;
    ctx.drawImage(video, 0, 0, width, height);

    photo.toBlob(async (blob) => {
      if (blob) {
        const id = uuidv4();
        const file = new File([blob], `photo-${id}.png`, {
          type: "image/png",
        });
        await uploadPhoto(file, id); // Pass the UUID
      } else {
        console.error("Failed to convert canvas to blob");
      }
    }, "image/png");

    setHasPhoto(true);
  };

  const closePhoto = () => {
    let photo = photoRef.current;
    let ctx = photo.getContext("2d");
    ctx.clearRect(0, 0, photo.width, photo.height);
    setHasPhoto(false);
  };

  useEffect(() => {
    getVideo();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Take a Photo and Upload</h1>
        <div>
          <video ref={videoRef} style={{ width: 600 }} />
          <button onClick={takePhoto}>SNAP!</button>
        </div>

        <div className={"result" + (hasPhoto ? " hasPhoto" : "")}>
          <canvas ref={photoRef}></canvas>
          {hasPhoto && <button onClick={closePhoto}>Close!</button>}
        </div>
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