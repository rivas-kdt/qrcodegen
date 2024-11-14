import React, { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { QRCodeSVG } from "qrcode.react"; // Import the QRCode component

// Loading spinner component
const LoadingSpinner = () => (
  <div className="spinner">
    <div className="circle"></div>
  </div>
);

function Home() {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [uploadInfo, setUploadInfo] = useState(null); // To store upload metadata
  const [location, setLocation] = useState({ lat: null, lng: null }); // To store latitude and longitude
  const [isUploading, setIsUploading] = useState(false); // To manage upload state

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

  // Get current location using the browser's Geolocation API
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location", error);
        }
      );
    }
  };

  // Upload photo to Vercel serverless function
  const uploadPhoto = async (file, uuid) => {
    if (!location.lat || !location.lng) {
      alert("Location data is not available. Please allow location access.");
      return;
    }

    setIsUploading(true);  // Start loading state

    const formData = new FormData();
    formData.append("image", file);
    formData.append("uuid", uuid); // Send UUID along with the image
    formData.append("latitude", location.lat);  // Send latitude
    formData.append("longitude", location.lng); // Send longitude

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error");
      }

      const result = await response.json();
      console.log("Upload successful:", result);

      // Set metadata for the uploaded file
      setUploadInfo({
        uuid: result.uuid,
        url: result.url,
        latitude: result.latitude,
        longitude: result.longitude,
      });

      alert("Photo uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error.message);
      alert("Upload failed: " + error.message);
    } finally {
      setIsUploading(false);  // End loading state
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
    getLocation(); // Get location when the component mounts
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Take a Photo and Upload</h1>
        <div>
          <video ref={videoRef} style={{ width: 600 }} />
          <button onClick={takePhoto} disabled={isUploading}>
            {isUploading ? "Uploading..." : "SNAP!"}
          </button>
        </div>

        <div className={"result" + (hasPhoto ? " hasPhoto" : "")}>
          <canvas ref={photoRef}></canvas>
          {hasPhoto && <button onClick={closePhoto}>Close!</button>}
        </div>

        {isUploading && <LoadingSpinner />} {/* Show loading spinner while uploading */}

        {/* Display upload information */}
        {uploadInfo && (
          <div>
            <h2>Upload Info</h2>
            <p>UUID: {uploadInfo.uuid}</p>
            <p>Location: {uploadInfo.latitude}, {uploadInfo.longitude}</p>
            <p>
              URL: <a href={uploadInfo.url} target="_blank" rel="noopener noreferrer">{uploadInfo.url}</a>
            </p>

            {/* Generate and display the QR Code */}
            <h3>Scan the QR Code to Access the Photo:</h3>
            <QRCodeSVG value={`${uploadInfo.url}/${uploadInfo.uuid}`} size={256} />
          </div>
        )}
      </header>
    </div>
  );
}

export default Home;
