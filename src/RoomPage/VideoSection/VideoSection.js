import React, { useRef, useEffect } from "react";

// Reference: https://github.com/alwin-97/VideoCall-React/blob/master/src/routes/Room.js
// Trying to use the logic from: https://github.com/arunkumaraqm/Video-Conferencing-Webrtc/blob/videoconf/main.js
const VideoSection = (props) => {

  const userVideo = useRef();
  const partnerVideo = useRef();
  const userStream = useRef();
  useEffect(
    () => {
      navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(
        stream => {
        userVideo.current.srcObject = stream;
        userStream.current = stream;
      })
    },
    []);

  return (
    <video controls style={{ width: 500 }} autoPlay ref={userVideo} />
  );

  function createPeerConnection(yourId) {
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org"
        },
        {
          urls: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com'
        },
      ]
    });
    pc.onicecandidate = (event => {
      if (event.candidate)
        sendMessage(yourId, JSON.stringify({ 'ice': event.candidate }));
      else
        console.log("Sent All Ice");
    });

    pc.onaddstream = (event => {
      friendsVideo.srcObject = event.stream;
    });

    pc.onconnectionstatechange = () => {
      const connectionStatus = pc.connectionState;
      if (["disconnected", "failed", "closed"].includes(connectionStatus)) {
        console.log(connectionStatus);
        (pc.connectionState == 'disconnected') ? notifyThatOtherPersonLeft('disconnected') : notifyThatOtherPersonLeft("ditched");
      }
    };

    return pc;
  }

  // Send something to the signalling server
  function sendMessage(senderId, data) {
    var msg = database.push({ sender: senderId, message: data });
    msg.remove();
  }

  // Receive something from the signalling server
  function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;

    console.log(yourId, sender, msg.leaving);

    if (sender != yourId && msg.leaving == undefined) {

      if (msg.ice != undefined)
        pc.addIceCandidate(new RTCIceCandidate(msg.ice));

      else if (msg.sdp.type == "offer")
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
          .then(() => pc.createAnswer())
          .then(answer => pc.setLocalDescription(answer))
          .then(() => sendMessage(yourId, JSON.stringify({ 'sdp': pc.localDescription })));

      else if (msg.sdp.type == "answer")
        pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
    else if (sender != yourId && msg.leaving == true) {
      notifyThatOtherPersonLeft("left");
      pc.close();
    }
  };

  // Receive new entry from the signalling server whenever a new entry occurs
  database.on('child_added', readMessage);
}


export default VideoSection;

// import React, { useState } from "react";
// import VideoButtons from "./VideoButtons";
// import Videos from "./Videos";
// import config from './config'
// import firebase from 'firebase/compat/app';
// import 'firebase/database';
// import VideoChat from './VideoChat'
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

// class VideoSection extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       database: null,
//       connectedUser: null,
//       localStream: null,
//       localConnection: null
//     }
//     this.localVideoRef = React.createRef()
//     this.remoteVideoRef = React.createRef()
//   }

//   componentDidMount = async () => {
//     firebase.initializeApp(config)

//     // getting local video stream
//     const localStream = await initiateLocalStream()
//     this.localVideoRef.srcObject = localStream

//     // const localConnection = await initiateConnection()

//     this.setState({
//       // database: firebase.database(),
//       localStream,
//       // localConnection
//     })
//   }

//   shouldComponentUpdate(nextProps, nextState) {
//     // if (this.state.database !== nextState.database) {
//     //   return false
//     // }
//     if (this.state.localStream !== nextState.localStream) {
//       return false
//     }
//     // if (this.state.localConnection !== nextState.localConnection) {
//     //   return false
//     // }

//     return true
//   }

//   // startCall = async (username, userToCall) => {
//   //   const { localConnection, database, localStream } = this.state
//   //   listenToConnectionEvents(localConnection, username, userToCall, database, this.remoteVideoRef, doCandidate)
//   //   // create an offer
//   //   createOffer(localConnection, localStream, userToCall, doOffer, database, username)
//   // }

//   // onLogin = async (username) => {
//   //   return await doLogin(username, this.state.database, this.handleUpdate)
//   // }

//   setLocalVideoRef = ref => {
//     this.localVideoRef = ref
//   }

//   // setRemoteVideoRef = ref => {
//   //   this.remoteVideoRef = ref
//   // }

//   // handleUpdate = (notif, username) => {
//   //   const { localConnection, database, localStream } = this.state

//   //   if (notif) {
//   //     switch (notif.type) {
//   //       case 'offer':
//   //         this.setState({
//   //           connectedUser: notif.from
//   //         })

//   //         listenToConnectionEvents(localConnection, username, notif.from, database, this.remoteVideoRef, doCandidate)

//   //         sendAnswer(localConnection, localStream, notif, doAnswer, database, username)
//   //         break
//   //       case 'answer':

//   //         this.setState({
//   //           connectedUser: notif.from
//   //         })
//   //         startCall(localConnection, notif)
//   //         break
//   //       case 'candidate':
//   //         addCandidate(localConnection, notif)
//   //         break
//   //       default:
//   //         break
//   //     }
//   //   }
//   // }

//   render() {
//     return <VideoChat
//       // startCall={this.startCall}
//       // onLogin={this.onLogin}
//       setLocalVideoRef={this.setLocalVideoRef}
//     // setRemoteVideoRef={this.setRemoteVideoRef}
//     // connectedUser={this.state.connectedUser}
//     />
//   }
// }

// export default VideoSection;


// // const initiateLocalStream = async () => {
// //   try {
// //     const stream = await navigator.mediaDevices.getUserMedia({
// //       video: true,
// //       audio: true
// //     })
// //     return stream
// //   } catch (exception) {
// //     console.error(exception)
// //   }
// // }

// // const addVideo = async(localVideoRef) => {
// //   const localStream = await initiateLocalStream()
// //   localVideoRef.srcObject = localStream
// // }

// // let localVideoRef = React.createRef()
// // let setLocalVideoRef = ref => {
// //   localVideoRef = ref
// // }

// // const VideoSection = () => {
// //   const [room, setRoom] = useState(null);

// //   addVideo(localVideoRef);

// //   return (
// //     <div className="video_section_container">
// //       <Videos room={room} setRoom={setRoom} />
// //       <video ref={setLocalVideoRef} playsInline="true" autoPlay="true" />
// //       <VideoButtons room={room} />
// //     </div>
// //   );
// // };

// export default VideoSection;