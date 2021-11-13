import React, { useState } from "react";
import VideoButtons from "./VideoButtons";
import Videos from "./Videos";
import video1 from "../../resources/images/Stencil.mp4"

const VideoSection = () => {
  const [room, setRoom] = useState(null);

  return (
    <div className="video_section_container">
      <Videos room={room} setRoom={setRoom} />
      <video src={video1} width="600" height="300" controls="true" playsInline="true" autoPlay="true" />
      <VideoButtons room={room} />
    </div>
  );
};

export default VideoSection;
