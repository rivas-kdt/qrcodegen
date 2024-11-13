import {useEffect, useRef, useState} from "react"
import { put } from "@vercel/blob"

function App() {
  const videoRef = useRef(null);
  const photoRef = useRef(null);
  const [hasPhoto, setHasPhoto] = useState(false)

  const getVideo = () => {
    navigator.mediaDevices
      .getUserMedia({video: {width: 600, height: 360}
      })
      .then(stream => {
        let video = videoRef.current
        video.srcObject = stream
        video.play();
      })
      .catch(err => {
        console.log(err)
      })
  }

  const uploadPhoto = async (dataURL) => {
    try {
      const response = await fetch(dataURL);
      const blob = await response.blob();
      const fileName = `photo-${Date.now()}.png`;
      const result = await put(blob, {
        path: fileName,
        contentType: 'image/png',
      });
  
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
};

  const takePhoto = () => {
    const width = 414;
    const height = width / (16/9)

    let video = videoRef.current
    let photo = photoRef.current

    photo.width=width
    photo.height = height

    let ctx = photo.getContext('2d')
    ctx.drawImage(video, 0 , 0, width, height)
    const dataURL = photo.toDataURL('image/png')
    uploadPhoto(dataURL)
    setHasPhoto(true)
  }

  const closePhoto = () => {
    let photo = photoRef.current
    let ctx = photo.getContext('2d')
    ctx.clearRect(0, 0, photo.width, photo.height)
    setHasPhoto(false)
  }

  useEffect(()=>{
    getVideo();
  }, [videoRef])

  return (
    <div className="App">
      <header className="App-header">
        <p>HELLO WORLD</p>
        <div>
          <video ref={videoRef}></video>
          <button onClick={takePhoto}>SNAP!</button>
        </div>
        <div className={'result' + (hasPhoto ? 'hasPhoto' : '')}>
          <canvas ref={photoRef}></canvas>
          <button onClick={closePhoto}>Close!</button>
        </div>
      </header>
    </div>
  );
}

export default App;
