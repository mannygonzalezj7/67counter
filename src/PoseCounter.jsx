import { useEffect, useRef, useState } from "react";
import { Pose, POSE_CONNECTIONS } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import PaymentModal from "./PaymentModal";

export default function PoseCounter() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [count, setCount] = useState(0);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [imageSrc, setImageSrc] = useState("/kai.webp");
  const [tooClose, setTooClose] = useState(false)
  const [imageName, setImageName] = useState("Kai Cenat")
  const [imagePoints, setImagePoints] = useState([])
  const [maxProgress, setMaxProgress] = useState()
  

  const forearmUp = useRef(false); // state that persists without re-renders
  function getRandomInt(max) {
  return Math.floor(Math.random() * max);
  }

  function showVideo() {
    const overlay = document.getElementById("video-overlay");
    const video = document.getElementById("popup-video");

    overlay.style.display = "flex";        // show overlay
    video.currentTime = 0;                 // restart video
    video.play();

    video.onended = () => {
      overlay.style.display = "none";      // hide when done
    };
  }
  
  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");

    const jumpScareCount = getRandomInt(10);
    const jumpScareElement = document.getElementById("NotAJumpscare.mp4")

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
  
    setMaxProgress(10);

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
            if (newCount == jumpScareCount){
              showVideo()
            }
            else if (newCount >= 6767) {
              setImageName("Super 6 7")
              setImageSrc("/super67.webp");
              setMaxProgress("10000")
            }
            else if (newCount >= 1000) {
                setImageName("Jonkler")
              setImageSrc("/joker.webp");
              setMaxProgress("6767")
            }
            else if (newCount >= 420) {
                setImageName("Snoop DOgg")
              setImageSrc("/snoop.jpg");
              setMaxProgress("1000")
            }
            else if (newCount >= 305) {
                setImageName("Mr. 305")
              setImageSrc("/dale.jpg");
              setMaxProgress("420")
            }
            else if (newCount >= 67) {
                setImageName("6 7 Kid")
              setImageSrc("/sixseven.png");
              setMaxProgress("305")
              
            }
            else if (newCount >= 23 ) {
                setImageName("His Excellency")
              setImageSrc("/legoat.png");
              setMaxProgress("67")
            }
            else if (newCount >= 10) {
                setImageName("IShowSpeed")
              setImageSrc("/speed.jpg");
              setMaxProgress("23")
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
      <PaymentModal onAddReps={(n) => setCount((c) => c + n)} />

      <div id="video-overlay">
        <video id="popup-video" width="100%" height="100%">
          <source src="NotAJumpscare.mp4" type="video/mp4"></source>
        </video>
      </div>

      <h1 className="title-glow">⁶🤷⁷ Counter</h1>
      <div className="counter-glow">Number of 67 Repetitions: {count}</div>

      <div>
      <h2 htmlFor="file">Progress to next character: </h2>
      <progress id="file" value={count} max={maxProgress}></progress>
      </div>

      

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

      <audio controls autoPlay>
        <source src="public/TheFatRat - Unity 4.mp3" type="audio/mpeg"></source>
      </audio>

      <button
        className="btn-crazy"
        onClick={() => setShowLandmarks((prev) => !prev)}
      >
        Toggle Skeleton
      </button>

    </div>
  );
}
