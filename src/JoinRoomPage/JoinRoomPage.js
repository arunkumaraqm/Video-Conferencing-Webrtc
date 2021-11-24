import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { setIsRoomHost } from "../store/actions";
import { useLocation } from "react-router-dom";
import JoinRoomTitle from "./JoinRoomTitle";
import JoinRoomContent from "./JoinRoomContent";
import LoadingOverlay from "./LoadingOverlay";

import "./JoinRoomPage.css";

const JoinRoomPage = (props) => {
  const { setIsRoomHostAction, isRoomHost } = props;

  const search = useLocation().search; // the query string part from the URL; remember a '?host=true' is added to the url when the user is logging in as host

  useEffect(() => {
    const isRoomHost = new URLSearchParams(search).get("host"); // getting the value associated with the 'host' key from the query string part
    if (isRoomHost) {
      setIsRoomHostAction(true);
    }
  }, []);

  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);

  return (
    <div className="join_room_page_container">
      <div className="join_room_page_panel">
        <JoinRoomTitle isRoomHost={isRoomHost} />
        <JoinRoomContent setShowLoadingOverlay={setShowLoadingOverlay} />
        {showLoadingOverlay && <LoadingOverlay />}
      </div>
    </div>
  );
};


const mapStoreStateToProps = (state) => { // state refers to Redux state
  // usually you only return certain values from `state` like return {nfcakes: state.nfcakes} but here we return all of them 
  return {
    ...state, // this syntax desconstructs `state` just like tuple unpacking in Python
  }; // "apart from whatever props it was already receiving, this component will now receive an additional prop called nfcakes which reflects the nf cakes in the Redux store."
};

const mapDispatchToProps = (dispatch) => {
  return {
    setIsRoomHostAction: (isRoomHost) => dispatch(setIsRoomHost(isRoomHost)), // setIsRoomHost is the action
  }; // returns functions that are added as additional props
};

export default connect(mapStoreStateToProps, mapDispatchToProps)(JoinRoomPage); // connects this component to Redux store
