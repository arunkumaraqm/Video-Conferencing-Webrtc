import React from "react";
import ParticipantsSection from "./ParticipantsSection/ParticipantsSection";
import VideoSection from "./VideoSection/VideoSection";
import ChatSection from "./ChatSection/ChatSection";
import { useLocation } from "react-router-dom";

import "./RoomPage.css";

const RoomPage = () => {

  const location = useLocation();
  let myname = location.state.name;
  console.log("My name is ", myname);

  return (
    <div className="room_container">
      <ParticipantsSection />
      <VideoSection />
      <ChatSection />
    </div>
  );
};

export default RoomPage;
