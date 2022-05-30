import React, { useCallback } from "react";
import styled from "styled-components";
import CameraSvg from "../../resources/images/camera.svg";
import MicButton from "../../resources/images/mic.svg";
import SwitchToScreenSharingButton from "../../resources/images/switchToScreenSharing.svg";
import EndCallButton from "../../resources/images/endCall.png";

class BottomBar extends React.Component {

  constructor(props){
    super(props)
    this.screenShare = props.screenShare;
    this.hangup = props.hangup;
    this.state = {
      isScreenShareButtonDisabled: null
    }
    // let setShowVideoDevices = props.setShowVideoDevices;    
    // let clickScreenSharing = props.clickScreenSharing;
  }

  static getDerivedStateFromProps(props, state) {
    console.log("getDerivedStateFromProps method is called");
    return {
      isScreenShareButtonDisabled: props.isScreenShareButtonDisabled
    };
  }
  
  // const handleToggle = useCallback(
  //   (e) => {
  //     setShowVideoDevices((state) => !state);
  //   },
  //   [setShowVideoDevices]
  // );
  render(){
    return (
      <Bar>
        <CameraButton>
          {/* <div>
              {userVideoAudio.video ? (
                <FaIcon className="fas fa-video"></FaIcon>
              ) : (
                <FaIcon className="fas fa-video-slash"></FaIcon>
              )}
            </div> */}
          <img src={CameraSvg} style={{ paddingLeft: "33%" }}></img>
        </CameraButton>
        <CameraButton>
          {/* <div>
              {userVideoAudio.audio ? (
                <FaIcon className="fas fa-microphone"></FaIcon>
              ) : (
                <FaIcon className="fas fa-microphone-slash"></FaIcon>
              )}
            </div> */}
          <img src={MicButton} style={{ paddingLeft: "33%" }}></img>
        </CameraButton>
        <ScreenButton onClick={()=>{
          if (!this.state.isScreenShareButtonDisabled){
            this.screenShare();
          }
        }}>
          <div>
            <FaIcon
              className={`fas fa-desktop ${!this.state.isScreenShareButtonDisabled ? "sharing" : ""}`}
            ></FaIcon>
          </div>
          <img
            src={SwitchToScreenSharingButton}
            style={{ paddingLeft: "33%" }}
          ></img>
        </ScreenButton>
        {/* <ChatButton onClick={clickChat}>
          <div>
            <FaIcon className="fas fa-comments"></FaIcon>
          </div>
          Chat
        </ChatButton> */}
        <StopButton
          onClick={this.hangup}
        >
          <img src={EndCallButton} style={{ paddingLeft: "33%" }}></img>
        </StopButton>
      </Bar>
    );
  }
};

const Bar = styled.div`
  position: absolute;
  bottom: 0;
  height: 8%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  background-color: black;
`;

// const ChatButton = styled.div`
//   width: 75px;
//   border: none;
//   font-size: 0.9375rem;
//   padding: 5px;
//   :hover {
//     background-color: #77b7dd;
//     cursor: pointer;
//     border-radius: 15px;
//   }
//   * {
//     pointer-events: none;
//   }
// `;

const ScreenButton = styled.div`
  position: relative;
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;
  :hover {
    background-color: #f8e3df;
    cursor: pointer;
    border-radius: 15px;
  }
  * {
    pointer-events: none;
  }
  .fa-microphone-slash {
    color: #ee2560;
  }
  .fa-video-slash {
    color: #ee2560;
  }
`;

const FaIcon = styled.i`
  width: 30px;
  font-size: calc(16px + 1vmin);
`;

const StopButton = styled.div`
  position: relative;
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;
  :hover {
    background-color: red;
    cursor: pointer;
    border-radius: 15px;
  }
`;

const CameraButton = styled.div`
  position: relative;
  width: 75px;
  border: none;
  font-size: 0.9375rem;
  padding: 5px;
  :hover {
    background-color: #f8e3df;
    cursor: pointer;
    border-radius: 15px;
  }
  * {
    pointer-events: none;
  }
  .fa-microphone-slash {
    color: #ee2560;
  }
  .fa-video-slash {
    color: #ee2560;
  }
`;

export default BottomBar;
