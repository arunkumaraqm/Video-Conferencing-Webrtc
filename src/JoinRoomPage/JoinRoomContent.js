import React, { useState } from "react";
import { connect } from "react-redux";
import {
  setConnectOnlyWithAudio,
  setIdentity,
  setRoomId,
} from "../store/actions";
import JoinRoomInputs from "./JoinRoomInputs";
import OnlyWithAudioCheckbox from "./OnlyWithAudioCheckbox";
import RoomNotFoundMessage from "./RoomNotFoundMessage";
import JoinRoomButtons from "./JoinRoomButtons";
import { useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const JoinRoomContent = (props) => {
  const {
    isRoomHost,
    setConnectOnlyWithAudioAction,
    connectOnlyWithAudio,
    setRoomIdAction,
    setIdentityAction,
    setShowLoadingOverlay,
  } = props;

  const [roomIdValue, setRoomIdValue] = useState("");
  const [nameValue, setNameValue] = useState("");
  const [showRoomNotFoundMessage, setShowRoomNotFoundMessage] = useState(false);

  const history = useHistory();

  const handleJoinToRoom = async () => {
    setIdentityAction(nameValue);
    if (!isRoomHost) {
      history.push("/room", {
        isHost: false,
        identity: nameValue,
        roomId: roomIdValue,
      });
    } else {
      setRoomIdAction(uuidv4());
      history.push("/room", { isHost: true, identity: nameValue }); //
    }
  };

  return (
    <>
      <JoinRoomInputs
        roomIdValue={roomIdValue}
        setRoomIdValue={setRoomIdValue}
        nameValue={nameValue}
        setNameValue={setNameValue}
        isRoomHost={isRoomHost}
      />
      <OnlyWithAudioCheckbox
        setConnectOnlyWithAudio={setConnectOnlyWithAudioAction}
        connectOnlyWithAudio={connectOnlyWithAudio}
      />
      <RoomNotFoundMessage showRoomNotFoundMessage={showRoomNotFoundMessage} />
      <JoinRoomButtons
        isRoomHost={isRoomHost}
        handleJoinToRoom={handleJoinToRoom}
      />
    </>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setConnectOnlyWithAudioAction: (onlyWithAudio) =>
      dispatch(setConnectOnlyWithAudio(onlyWithAudio)),
    setIdentityAction: (identity) => dispatch(setIdentity(identity)),
    setRoomIdAction: (id) => dispatch(setRoomId(id)),
  };
};

const mapStoreStateToProps = (state) => {
  return {
    ...state,
  };
};

export default connect(
  mapStoreStateToProps,
  mapDispatchToProps
)(JoinRoomContent);
