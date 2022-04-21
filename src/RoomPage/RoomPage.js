import React from "react";
import VideoSection from "./VideoSection/VideoSection";

import { useLocation } from "react-router-dom";

import "./RoomPage.css";

const RoomPage = () => {
  const location = useLocation();
  let userInfo = location.state;
  console.log(location.state);
  // let myname = location.state.name;
  // console.log("My name and given roomid is ", myname, location.state.roomId);

  return (
    <div className="room_container">
      <VideoSection userInfo={userInfo} />
    </div>
  );
};

export default RoomPage;
