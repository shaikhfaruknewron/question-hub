"use client";

import { useRef, useState, useEffect } from "react";
import Button from "@/src/components/ui/Button";

const ProctoringSetup = ({ onReady, onCancel }) => {
const videoRef = useRef(null);
const streamRef = useRef(null);

const [cameraReady, setCameraReady] = useState(false);
const [microphoneReady, setMicrophoneReady] = useState(false);
const [fullscreenReady, setFullscreenReady] = useState(false);

const [isRequestingMedia, setIsRequestingMedia] = useState(false);
const [error, setError] = useState("");

useEffect(() => {
return () => {
streamRef.current?.getTracks().forEach((track) => {
track.stop();
});
};
}, []);

const enableCameraAndMicrophone = async () => {
try {
setError("");
setIsRequestingMedia(true);

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  streamRef.current = stream;

  if (videoRef.current) {
    videoRef.current.srcObject = stream;
  }

  const videoTrack = stream.getVideoTracks()[0];
  const audioTrack = stream.getAudioTracks()[0];

  setCameraReady(Boolean(videoTrack?.enabled));
  setMicrophoneReady(Boolean(audioTrack?.enabled));
} catch (err) {
  console.error("Failed to access camera or microphone:", err);

  setCameraReady(false);
  setMicrophoneReady(false);

  setError(
    "Camera and microphone access are required to start this test."
  );
} finally {
  setIsRequestingMedia(false);
}


};

const enterFullscreen = async () => {
try {
setError("");

  await document.documentElement.requestFullscreen();

  setFullscreenReady(true);
} catch (err) {
  console.error("Failed to enter fullscreen:", err);

  setFullscreenReady(false);

  setError(
    "Fullscreen access is required to start this test."
  );
}


};

const startTest = () => {
if (!cameraReady || !microphoneReady || !fullscreenReady) {
setError(
"Please enable camera, microphone, and fullscreen before starting."
);
return;
}
onReady(streamRef.current);
};

return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
         <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"> 
            <h2 className="text-xl font-semibold">
                Test Proctoring Setup </h2>

    <p className="mt-2 text-sm text-gray-600">
      Camera, microphone, and fullscreen access are required before
      starting this test.
    </p>

    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <div>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="aspect-video w-full rounded-lg bg-black object-cover"
        />

        <Button
          className="mt-3 w-full"
          onClick={enableCameraAndMicrophone}
          disabled={isRequestingMedia}
        >
          {isRequestingMedia
            ? "Requesting Access..."
            : cameraReady && microphoneReady
            ? "Camera & Microphone Enabled"
            : "Enable Camera & Microphone"}
        </Button>
      </div>

      <div className="flex flex-col justify-center gap-4">
        <div className="rounded-lg border p-4">
          <p className="font-medium">
            Camera:{" "}
            <span
              className={
                cameraReady
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {cameraReady ? "Ready" : "Not Ready"}
            </span>
          </p>

          <p className="mt-2 font-medium">
            Microphone:{" "}
            <span
              className={
                microphoneReady
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {microphoneReady ? "Ready" : "Not Ready"}
            </span>
          </p>

          <p className="mt-2 font-medium">
            Fullscreen:{" "}
            <span
              className={
                fullscreenReady
                  ? "text-green-600"
                  : "text-red-600"
              }
            >
              {fullscreenReady ? "Ready" : "Not Ready"}
            </span>
          </p>
        </div>

        <Button
          onClick={enterFullscreen}
          disabled={fullscreenReady}
        >
          {fullscreenReady
            ? "Fullscreen Enabled"
            : "Enter Fullscreen"}
        </Button>

        <Button
          onClick={startTest}
          disabled={
            !cameraReady ||
            !microphoneReady ||
            !fullscreenReady
          }
        >
          Start Test
        </Button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Cancel
          </button>
        )}
      </div>
    </div>

    {error && (
      <p className="mt-4 text-sm text-red-600">
        {error}
      </p>
    )}
  </div>
</div>

);
};

export default ProctoringSetup;
