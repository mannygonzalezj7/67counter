import { useEffect, useRef, useState } from "react";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

export default function PoseCounter() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [count, setCount] = useState(0);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [imageSrc, setImageSrc] = useState("/kai.webp");
  const [tooClose, setTooClose] = useState(false);
  const [imageName, setImageName] = useState("Kai Cenat")
  const [imagePoints, setImagePoints] = useState([])

  const forearmUp = useRef(false); // state that persists without re-renders

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.6,
    });

    pose.onResults((results) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Draw webcam feed
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasElement.width,
        canvasElement.height
      );

      if (results.poseLandmarks) {
        const lm = results.poseLandmarks;
        setImagePoints(lm)

        if (showLandmarks) {
          drawConnectors(canvasCtx, lm, POSE_CONNECTIONS, {
            color: "#ff2edb",
            lineWidth: 3,
          });
          drawLandmarks(canvasCtx, lm, {
            color: "#00f7ff",
            radius: 3,
          });
        }

        const missing =
        lm[14].visibility < 0.5 || lm[16].visibility < 0.5 || lm[13].visibility  < 0.5 || lm[15].visibility < 0.5;

        setTooClose(missing);
        setImagePoints([lm[14], lm[16], lm[13], lm[15]])


        const wristR = lm[16];
        const elbowR = lm[14];

        const isUpR = wristR.y < elbowR.y;

        if (isUpR && !forearmUp.current) {
          forearmUp.current = true;

          setCount((prev) => {
            const newCount = prev + 1;

            // Image logic
            if (newCount >= 67) {
                setImageName("6 7 Kid")
              setImageSrc("/sixseven.png");
              
            } else if (newCount >= 10) {
                setImageName("IShowSpeed")
              setImageSrc("/speed.jpg");
            }

            return newCount;
          });
        }

        if (!isUpR) {
          forearmUp.current = false;
        }
      }

      canvasCtx.restore();
    });

    // Camera setup
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await pose.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    camera.start();
  }, [showLandmarks]);

  return (
    <div className="appContainer">
      <h1 className="title-glow">⁶🤷⁷ Counter</h1>
      <div className="counter-glow">Number of 67 Repetitions: {count}</div>

      <div className="main">
        <div className="container aura">
          <video ref={videoRef} autoPlay playsInline className="video"></video>
          <canvas ref={canvasRef} width={640} height={480}></canvas>

          {tooClose && (
            <div className="overlay">
            <p className="overlay-text">Hands not visible</p>
        </div>
  )}
        </div>

        <div className="side-panel">
          <h1 className="youare">You Are: {imageName}</h1>
          <img src={imageSrc} className="image spin" />
        </div>
      </div>

      <button
        className="btn-crazy"
        onClick={() => setShowLandmarks((prev) => !prev)}
      >
        Toggle Skeleton
      </button>
    </div>
  );
}
