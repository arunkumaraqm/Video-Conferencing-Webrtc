import React, { useState } from "react";
import VideoButtons from "./VideoButtons";
import Videos from "./Videos";

import VideoChat from "./VideoChat";
const initiateLocalStream = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return stream;
  } catch (exception) {
    console.error(exception);
  }
};

class VideoSection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      database: null,
      connectedUser: null,
      localStream: null,
      localConnection: null,
    };
    this.userInfo = props.userInfo;
    // console.log(this.userInfo);
    this.localVideoRef = React.createRef();
    this.remoteVideoRef = React.createRef();
  }

  // componentDidMount = async () => {
  //   // firebase.initializeApp(config)

  //   // getting local video stream
  //   const localStream = await initiateLocalStream()
  //   this.localVideoRef.srcObject = localStream

  //   // const localConnection = await initiateConnection()

  //   this.setState({
  //     // database: firebase.database(),
  //     localStream,
  //     // localConnection
  //   })
  // }

  // shouldComponentUpdate(nextProps, nextState) {
  //   // if (this.state.database !== nextState.database) {
  //   //   return false
  //   // }
  //   if (this.state.localStream !== nextState.localStream) {
  //     return false
  //   }
  //   // if (this.state.localConnection !== nextState.localConnection) {
  //   //   return false
  //   // }

  //   return true
  // }

  // startCall = async (username, userToCall) => {
  //   const { localConnection, database, localStream } = this.state
  //   listenToConnectionEvents(localConnection, username, userToCall, database, this.remoteVideoRef, doCandidate)
  //   // create an offer
  //   createOffer(localConnection, localStream, userToCall, doOffer, database, username)
  // }

  // onLogin = async (username) => {
  //   return await doLogin(username, this.state.database, this.handleUpdate)
  // }

  // setLocalVideoRef = ref => {
  //   this.localVideoRef = ref
  // }

  // setRemoteVideoRef = ref => {
  //   this.remoteVideoRef = ref
  // }

  // handleUpdate = (notif, username) => {
  //   const { localConnection, database, localStream } = this.state

  //   if (notif) {
  //     switch (notif.type) {
  //       case 'offer':
  //         this.setState({
  //           connectedUser: notif.from
  //         })

  //         listenToConnectionEvents(localConnection, username, notif.from, database, this.remoteVideoRef, doCandidate)

  //         sendAnswer(localConnection, localStream, notif, doAnswer, database, username)
  //         break
  //       case 'answer':

  //         this.setState({
  //           connectedUser: notif.from
  //         })
  //         startCall(localConnection, notif)
  //         break
  //       case 'candidate':
  //         addCandidate(localConnection, notif)
  //         break
  //       default:
  //         break
  //     }
  //   }
  // }

  render() {
    return (
      <VideoChat
        // startCall={this.startCall}
        // onLogin={this.onLogin}
        userInfo={this.userInfo}
        setLocalVideoRef={this.setLocalVideoRef}
        // setRemoteVideoRef={this.setRemoteVideoRef}
        // connectedUser={this.state.connectedUser}
      />
    );
  }
}

export default VideoSection;

// const initiateLocalStream = async () => {
//   try {
//     const stream = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true
//     })
//     return stream
//   } catch (exception) {
//     console.error(exception)
//   }
// }

// const addVideo = async(localVideoRef) => {
//   const localStream = await initiateLocalStream()
//   localVideoRef.srcObject = localStream
// }

// let localVideoRef = React.createRef()
// let setLocalVideoRef = ref => {
//   localVideoRef = ref
// }

// const VideoSection = () => {
//   const [room, setRoom] = useState(null);

//   addVideo(localVideoRef);

//   return (
//     <div className="video_section_container">
//       <Videos room={room} setRoom={setRoom} />
//       <video ref={setLocalVideoRef} playsInline="true" autoPlay="true" />
//       <VideoButtons room={room} />
//     </div>
//   );
// };

// export default VideoSection;
