import React from "react";
import { connect } from "react-redux";
import RoomLabel from "./RoomLabel";

const Videos = ({ room, setRoom, roomId }) => {
  return (
    <div className="videos_container">
      <RoomLabel roomId={roomId} />
      {room}
    </div>
  );
};

const mapStoreStateToProps = (state) => {
  return {
    ...state,
  };
};

export default connect(mapStoreStateToProps)(Videos);
