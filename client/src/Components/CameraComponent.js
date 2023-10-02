import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

const CameraComponent = () => {
  const webcamRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    async function getVideoDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((device) => device.kind === 'videoinput');
        setVideoDevices(videoInputs);
      } catch (error) {
        console.error('Error enumerating video devices:', error);
      }
    }
    getVideoDevices();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDeviceId, // Specify the selected camera
        },
        audio: false,
      });
      webcamRef.current.srcObject = stream;
      setIsCameraOn(true);
    } catch (error) {
      console.error('Error starting camera:', error);
    }
  };

  const stopCamera = () => {
    const stream = webcamRef.current.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
      setIsCameraOn(false);
    }
  };

  const takeSnapshot = () => {
    const imageSrc = webcamRef.current.getScreenshot();
  
    // Create a Blob from the base64-encoded image
    const blob = dataURItoBlob(imageSrc);
  
    // Create a FormData object to send the image to the server
    const formData = new FormData();
    formData.append('snapshot', blob, 'snapshot.jpg'); // 'snapshot.jpg' is the desired file name
  
    // Send the formData to your backend using a fetch or Axios
    fetch('/camera', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        // Handle the response from the server
        console.log('Snapshot saved successfully');
      })
      .catch((error) => {
        console.error('Error saving snapshot:', error);
      });
  
    setSnapshot(imageSrc);
  };
  
  // Function to convert data URI to Blob
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
  
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
  
    return new Blob([ab], { type: mimeString });
  }
  
  return (
    <div>
      <div>
        <Webcam
          audio={false}
          ref={webcamRef}
          width={640}
          height={480}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: 'user',
            deviceId: selectedDeviceId, // Use the selected camera
          }}
          style={{ display: isCameraOn ? 'block' : 'none' }}
        />
        {snapshot && (
          <img src={snapshot} alt="Snapshot" style={{ display: 'block', width: '100%' }} />
        )}
      </div>
      <div>
        <label>Select Camera:</label>
        <select
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          value={selectedDeviceId || ''}
        >
          <option value="">Default Camera</option>
          {videoDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${videoDevices.indexOf(device) + 1}`}
            </option>
          ))}
        </select>
        <button onClick={startCamera} disabled={isCameraOn}>
          Start Camera
        </button>
        <button onClick={stopCamera} disabled={!isCameraOn}>
          Stop Camera
        </button>
        <button onClick={takeSnapshot} disabled={!isCameraOn}>
          Take Snapshot
        </button>
      </div>
    </div>
  );
};

export default CameraComponent;
