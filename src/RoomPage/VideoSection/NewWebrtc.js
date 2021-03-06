import React, { Component } from "react";
import { config } from "./config";
import firebase from "@firebase/app";
import "@firebase/firestore";
import BottomBar from "./BottomBar";
import TabGroup from "./ToggleBar";
import "../RoomPage.css";
import { sendFile } from "./SendFile";
import { base64ToBlob } from "./Base64Utility";
const DEBUG = false;
const log = console.log;

var app = firebase.initializeApp({
  apiKey: "AIzaSyCGBt_I2QwSgC_ZPhOjFLticf18ewCs1qY",
  authDomain: "videomeet-6d44c.firebaseapp.com",
  databaseURL: "https://videomeet-6d44c-default-rtdb.firebaseio.com",
  projectId: "videomeet-6d44c",
  storageBucket: "videomeet-6d44c.appspot.com",
  messagingSenderId: "116804159061",
  appId: "1:116804159061:web:0a3cb53888bb1ccd3776dc",
  measurementId: "G-LBD87LLZVL",
});

let PRESET_MESSAGES = [
  // {
  //   identity: "Achyut",
  //   content: "Hello.",
  // },
  // {
  //   content: "All good",
  //   messageCreatedByMe: true,
  //   identity: "me",
  // },
];

class NewWebrtc extends Component {
  constructor(props) {
    super(props);

    this.peerConnection = null;
    this.dataChannel = null;
    this.localVideoRef = React.createRef();
    this.remoteVideoRef = React.createRef();
    // this.localScreenShareRef = React.createRef();
    this.localStream = null;
    this.remoteStream = null;
    this.screenStream = null;
    this.listOfFileObjects = []
    if (!DEBUG) this.userInfo = props.userInfo;
    else
      this.userInfo = {
        identity: "Unnamed",
      };
    this.state = {
      roomId: null,
      isMeCaller: null,
      isCameraBtnDisabled: false,
      isCreateBtnDisabled: true,
      isJoinBtnDisabled: true,
      isHangupBtnDisabled: true,
      isRoomDialogVisible: false,
      listOfMessages: [...PRESET_MESSAGES],
      listOfParticipants: [],
      listOfFiles: [],
      isDataChannelOpen: false,
      isScreenShareAccepted: false,
      isScreenShareButtonDisabled: true,
      // isViewStreamDisabled: true,
      amISharingScreen: false,
      active: "Chat",
    };
    this.openUserMedia = this.openUserMedia.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.hangup = this.hangup.bind(this);
    this.confirmJoin = this.confirmJoin.bind(this);
    this.cancelJoin = this.cancelJoin.bind(this);
    this.registerPeerConnectionListeners =
      this.registerPeerConnectionListeners.bind(this);
    this.joinRoomById = this.joinRoomById.bind(this);
    this.getRoomIdString = this.getRoomIdString.bind(this);
    this.setupConnection = this.setupConnection.bind(this);
    this.handleRecvMessage = this.handleRecvMessage.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.handleSendFile = this.handleSendFile.bind(this);
    this.handleRequestFile = this.handleRequestFile.bind(this);
    this.handleSendFileInformation = this.handleSendFileInformation.bind(this);
    this.enableScreensharing = this.enableScreensharing.bind(this);
    this.screenShare = this.screenShare.bind(this);
    this.saveFile = this.saveFile.bind(this);
    // this.TabGroup = this.TabGroup.bind(this);
    // this.fooBar = this.fooBar.bind(this);
  }
  updatelist(textin) {
    this.setState({ list: this.state.list.concat([textin]) });
    console.log(this.state.list, "killarney");
  }
  componentDidMount() {
    console.log(this.userInfo);
    this.openUserMedia().then(() => {
      if (!DEBUG) {
        if (this.userInfo.isHost) {
          this.createRoom();
        } else {
          this.joinRoomById(this.userInfo.roomId);
          this.setState({
            isCreateBtnDisabled: true,
            isJoinBtnDisabled: true,
            isRoomDialogVisible: false,
          });
        }
      }
    });
  }

  async openUserMedia() {
    console.log("openusermedia called");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    this.localStream = stream;
    const localVideo = this.localVideoRef.current;
    localVideo.srcObject = stream;
    localVideo.width = 320;
    localVideo.play();

    this.remoteStream = new MediaStream();
    const remoteVideo = this.remoteVideoRef.current;
    remoteVideo.srcObject = this.remoteStream;
    remoteVideo.width = 320;
    remoteVideo.play();

    // this.screenStream = new MediaStream();
    // const screenVideo = this.localScreenShareRef.current;
    // screenVideo.srcObject = this.screenStream;
    // screenVideo.width = 320;
    // screenVideo.play();


    this.setState({
      isCameraBtnDisabled: true,
      isCreateBtnDisabled: false,
      isJoinBtnDisabled: false,
      isHangupBtnDisabled: true,
      listOfParticipants: this.state.listOfParticipants.concat([
        {
          identity: this.userInfo.identity,
        },
      ]),
    });
  }

  setupConnection() {
    console.log("Create PeerConnection with configuration: ", config);
    this.peerConnection = new RTCPeerConnection(config);
    this.dataChannel = this.peerConnection.createDataChannel("mydc");
    this.registerPeerConnectionListeners();

    this.setState({
      isChatDisabled: false,
      isScreenShareButtonDisabled: false,
      // isViewStreamDisabled: false,
      isHangupBtnDisabled: false

    });
  }

  async createRoom() {
    if (!DEBUG) {
    } else {
      this.userInfo.identity = "Hostalice";
    }
    this.setState({
      isCreateBtnDisabled: true,
      isJoinBtnDisabled: true,
      isMeCaller: true,
    });
    const db = firebase.firestore(app);
    const roomRef = await db.collection("rooms").doc();

    this.setupConnection();

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    // Code for collecting ICE candidates below
    const callerCandidatesCollection = roomRef.collection("callerCandidates");

    this.peerConnection.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        console.log("Got final candidate!");
        return;
      }
      console.log("Got candidate: ", event.candidate);
      callerCandidatesCollection.add(event.candidate.toJSON());
    });
    // Code for collecting ICE candidates above

    // Code for creating a room below
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    console.log("Created offer:", offer);

    const roomWithOffer = {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    };
    await roomRef.set(roomWithOffer);
    this.setState({ roomId: roomRef.id });
    console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
    // Code for creating a room above

    this.peerConnection.addEventListener("track", (event) => {
      console.log("Got remote track:", event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        console.log("Add a track to the remoteStream:", track);
        this.remoteStream.addTrack(track);
      });
    });

    roomRef.onSnapshot(async (snapshot) => {
      const data = snapshot.data();
      if (
        !this.peerConnection.currentRemoteDescription &&
        data &&
        data.answer
      ) {
        console.log("Got remote description: ", data.answer);
        const rtcSessionDescription = new RTCSessionDescription(data.answer);
        await this.peerConnection.setRemoteDescription(rtcSessionDescription);
      }
    });
    // Listening for remote session description above

    // Listen for remote ICE candidates below
    roomRef.collection("calleeCandidates").onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }
  async enableScreensharing() {

    this.screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    this.screenStream.oninactive = () => {
      this.disableScreensharing();
    }

    var screenVideoTrack = this.screenStream.getVideoTracks()[0];
    var sender = this.peerConnection.getSenders().find(function (s) {
      return s.track.kind === screenVideoTrack.kind;
    });
    sender.replaceTrack(screenVideoTrack);

    let tosend = {
      content: this.userInfo.identity + " started sharing their screen.",
      identity: '',
      type: "chat",
    };
    this.dataChannel.send(JSON.stringify(tosend));

    this.setState({
      amISharingScreen: true
    })
  }

  async disableScreensharing() {
    var localVideoTrack = this.localStream.getVideoTracks()[0];
    var sender = this.peerConnection.getSenders().find(function (s) {
      return s.track.kind == localVideoTrack.kind;
    });
    sender.replaceTrack(localVideoTrack);
    this.screenStream.getTracks().forEach(track => track.stop())

    this.setState({
      amISharingScreen: false
    })
  }

  async hangup() {
    const tracks = this.localStream.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
    }

    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.localStream = null;
    this.remoteStream = null;
    this.setState({
      roomId: null,
      isMeCaller: null,
      isCameraBtnDisabled: false,
      isCreateBtnDisabled: true,
      isJoinBtnDisabled: true,
      isHangupBtnDisabled: true,
      isRoomDialogVisible: false,
      isScreenShareButtonDisabled: true,
      amISharingScreen: false
    });

    // Delete room on hangup
    if (this.state.roomId) {
      // don't need to do this again
      const db = firebase.firestore();
      const roomRef = db.collection("rooms").doc(this.state.roomId);
      const calleeCandidates = await roomRef
        .collection("calleeCandidates")
        .get();
      calleeCandidates.forEach(async (candidate) => {
        await candidate.ref.delete();
      });
      const callerCandidates = await roomRef
        .collection("callerCandidates")
        .get();
      callerCandidates.forEach(async (candidate) => {
        await candidate.ref.delete();
      });
      await roomRef.delete();
    }

    if (!DEBUG) window.location.href = "/"; // go back to introduction page
    else window.location.reload(false); // reload this page when debugging
  }

  registerPeerConnectionListeners = () => {
    this.peerConnection.addEventListener("icegatheringstatechange", () => {
      console.log(
        `ICE gathering state changed: ${this.peerConnection.iceGatheringState}`
      );
    });

    this.peerConnection.addEventListener("connectionstatechange", () => {
      console.log(
        `Connection state change: ${this.peerConnection.connectionState}`
      );
      if (
        this.peerConnection.connectionState === "disconnected" ||
        this.peerConnection.connectionState === "closed"
      )
        this.hangup();
    });

    this.peerConnection.addEventListener("signalingstatechange", () => {
      console.log(
        `Signaling state change: ${this.peerConnection.signalingState}`
      );
    });

    this.peerConnection.addEventListener("iceconnectionstatechange ", () => {
      console.log(
        `ICE connection state change: ${this.peerConnection.iceConnectionState}`
      );
    });

    this.peerConnection.ondatachannel = (event) => {
      var receiveChannel = event.channel;
      let currentFile = []; // stores binary contents of file, is updated chunk by chunk
      let idx = -1; // stores location of file in this.state.listOfFiles since the file details are taken from that lsit
      receiveChannel.onmessage = (event) => {
        console.log(event.data, 'ULNA');
        let message = JSON.parse(event.data);

        switch (message.type) {
          case "chat": // on the recvr's side
            this.handleRecvMessage(message.content, message.identity);
            break;

          case "start":// on the recvr's side
            console.log(message);
            console.log("Receiving file", message.content);
            this.setState({
              // add the message you sent to your chat thread
              listOfFiles: this.state.listOfFiles.concat([
                {
                  identity: this.userInfo.identity,
                  fileCreatedByMe: false,
                  content: message.content,
                },
              ]),
            });
            console.log(this.state.listOfFiles, "perth");
            this.listOfFileObjects = this.listOfFileObjects.concat([{}])

            break;

          case "filesharing": // on the recvr's side
            currentFile.push(atob(message.content));
            console.log("Progress on file sharing");
            break;

          case "end": // on the recvr's side
            console.log("Done with file sharing", idx);
            this.saveFile(this.state.listOfFiles[idx].content, currentFile);
            console.log(this.state.listOfFiles, "yellow");
            currentFile = []
            idx = -1
            break;

          case "ackfilerequest": // on the recvr's side
            idx = message.content
            currentFile = []
            break;

          case "filerequest": // on the sender's side
            this.dataChannel.send(JSON.stringify({
              content: message.content,
              type: "ackfilerequest",
            }))
            this.handleSendFile(message.content);
            break;

          default:
            console.log("Invalid message sent via data channel.");

        }
      };
    };

    this.dataChannel.onerror = (err) => {
      log("data channel err", err);
    };

    // this.dataChannel.onmessage = (event) => {log('data channel on msg', event.data);} // pointless

    this.dataChannel.onopen = () => {
      log("data channel open");
      this.setState({
        isDataChannelOpen: true,
      });

      let tosend = {
        content: "You can now begin chatting.",
        identity: "",
        type: "chat", //
      };
      this.dataChannel.send(JSON.stringify(tosend));
      this.dataChannel.send(
        JSON.stringify({
          content: "",
          identity: this.userInfo.identity,
          type: "chat", //
        })
      );
    };

    this.dataChannel.onclose = () => {
      log("data channel closed");
      this.setState({
        isDataChannelOpen: false,
      });
    };
  };

  handleRequestFile(idx) {
    this.dataChannel.send(JSON.stringify({
      content: idx,
      identity: this.userInfo.identity,
      type: "filerequest",
    }))
  }

  saveFile(meta, data) {
    console.log(meta, "QUINT");
    // meta = JSON.parse(meta);
    var blob = base64ToBlob(data, meta.filetype);
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = meta.name;
    console.log("link has been added");
    link.click();
  }

  async joinRoomById(givenRoomId) {
    const db = firebase.firestore();
    const roomRef = db.collection("rooms").doc(`${givenRoomId}`);
    const roomSnapshot = await roomRef.get();
    console.log("Got room:", roomSnapshot.exists);

    if (roomSnapshot.exists) {
      console.log("Create PeerConnection with configuration: ", config);
      this.setupConnection();
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Code for collecting ICE candidates below
      const calleeCandidatesCollection = roomRef.collection("calleeCandidates");
      this.peerConnection.addEventListener("icecandidate", (event) => {
        if (!event.candidate) {
          console.log("Got final candidate!");
          return;
        }
        console.log("Got candidate: ", event.candidate);
        calleeCandidatesCollection.add(event.candidate.toJSON());
      });
      // Code for collecting ICE candidates above

      this.peerConnection.addEventListener("track", (event) => {
        console.log("Got remote track:", event.streams[0]);
        event.streams[0].getTracks().forEach((track) => {
          console.log("Add a track to the remoteStream:", track);
          this.remoteStream.addTrack(track);
        });
      });

      // Code for creating SDP answer below
      const offer = roomSnapshot.data().offer;
      console.log("Got offer:", offer);
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );
      const answer = await this.peerConnection.createAnswer();
      console.log("Created answer:", answer);
      await this.peerConnection.setLocalDescription(answer);

      const roomWithAnswer = {
        answer: {
          type: answer.type,
          sdp: answer.sdp,
        },
      };
      await roomRef.update(roomWithAnswer);
      console.log(roomWithAnswer);
      // Code for creating SDP answer above

      // Listening for remote ICE candidates below
      roomRef.collection("callerCandidates").onSnapshot((snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            let data = change.doc.data();
            console.log(
              `Got new remote ICE candidate: ${JSON.stringify(data)}`
            );
            await this.peerConnection.addIceCandidate(
              new RTCIceCandidate(data)
            );
          }
        });
      });
      // Listening for remote ICE candidates above
    } else {
      alert("Room does not exist.");

      this.setState({
        isCameraBtnDisabled: true,
        isCreateBtnDisabled: false,
        isJoinBtnDisabled: false,
        isHangupBtnDisabled: true,
      });
    }

    if (!DEBUG) {
    } else {
      this.userInfo.identity = "Nicebob";
    }
  }

  async confirmJoin(givenRoomId) {
    console.log("given room id", givenRoomId);
    await this.joinRoomById(givenRoomId);
    console.log("Join room: ", this.state.roomId);

    this.setState({
      isRoomDialogVisible: false,
    });
    // {once: true} isn't included here
  }

  async cancelJoin() {
    this.setState({
      isCreateBtnDisabled: false,
      isJoinBtnDisabled: false,
      isRoomDialogVisible: false,
    });
  }

  joinRoom() {
    this.setState({
      isCreateBtnDisabled: true,
      isJoinBtnDisabled: true,
      isRoomDialogVisible: true,
    });
  }

  getRoomIdString() {
    if (this.state.roomId && this.state.isMeCaller)
      return (
        <div className="create-button">
          <p>Current room is '{this.state.roomId}'. You are the caller.</p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(this.state.roomId);
            }}
          >
            Copy
          </button>
        </div>
      );
    else if (this.state.roomId && !this.state.isMeCaller)
      return <p>Current room is {this.state.roomId}. You are the callee.</p>;
    else return <p></p>;
  }

  showhideRoomDialog() {
    let givenRoomId = "";
    if (this.state.isRoomDialogVisible)
      return (
        <div className="showHideRoomDialog">
          <h2>Join room</h2>
          <div style={{ marginTop: "-1em" }}>
            Enter ID for room to join:
            <input
              type="text"
              id="room-id"
              onChange={(event) => (givenRoomId = event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  this.confirmJoin(givenRoomId);
                }
              }}
            />
          </div>

          <footer>
            <button type="button" onClick={() => this.cancelJoin()}>
              <span>Cancel</span>
            </button>
            <button
              id="confirmJoinBtn"
              type="button"
              onClick={() => this.confirmJoin(givenRoomId)}
            >
              <span>Join</span>
            </button>
          </footer>
        </div>
      );
    else return <div></div>;
  }

  handleSendMessage(content) {
    console.log(content);
    if (content === "") return;
    this.setState({
      // add the message you sent to your chat thread
      listOfMessages: this.state.listOfMessages.concat([
        {
          identity: this.userInfo.identity,
          messageCreatedByMe: true,
          content: content,
        },
      ]),
    });

    let message = {
      content: content,
      identity: this.userInfo.identity,
      type: 'chat',

    };
    this.dataChannel.send(JSON.stringify(message)); // actually send the message
  }

  handleRecvMessage(content, identity) {
    console.log("ondatachannel message:", content);
    // log(this.state);
    if (content === "") {
      this.setState({
        listOfParticipants: this.state.listOfParticipants.concat([
          {
            identity: identity,
          },
        ]),
      });
    } else
      this.setState({
        // add the message you received to your chat thread
        listOfMessages: this.state.listOfMessages.concat([
          {
            identity: identity,
            content: content,
          },
        ]),
      });
  }
  async handleSendFileInformation(fileInput) {
    var files = fileInput.current.files; // modified according to above
    this.listOfFileObjects = this.listOfFileObjects.concat([fileInput.current.files[0]])
    if (files.length > 0) {
      let jsontosend = {
        lastModified: files[0].lastModified,
        lastModifiedDate: files[0].lastModifiedDate,
        name: files[0].name,
        size: files[0].size,
        type: files[0].type,
        webkitRelativePath: files[0].webkitRelativePath
      }

      this.dataChannel.send(
        JSON.stringify({
          type: "start",
          content: jsontosend
        })
      );
      console.log(files[0], files[0].name, 'KLEON');
      this.setState({
        listOfFiles: this.state.listOfFiles.concat([
          {
            identity: this.userInfo.identity,
            fileCreatedByMe: true,
            content: files[0],
          },
        ]),
      });
    }
  }
  handleSendFile(idx) {
    let file = this.listOfFileObjects[idx]
    sendFile(file, this.dataChannel);
  }

  screenShare() {
    return this.state.amISharingScreen ? this.disableScreensharing() : this.enableScreensharing()
  }

  render() {
    return (
      <div className="new-webrtc">

        <div className="topbar">
          <div id="buttons">
            <button
              id="cameraBtn"
              disabled={this.state.isCameraBtnDisabled}
              onClick={() => this.openUserMedia()}
            >
              <span>Open camera & microphone</span>
            </button>
            <button
              id="createBtn"
              disabled={this.state.isCreateBtnDisabled}
              onClick={() => this.createRoom()}
            >
              <span>Create room</span>
            </button>
            <button
              id="joinBtn"
              disabled={this.state.isJoinBtnDisabled}
              onClick={() => this.joinRoom()}
            >
              <span>Join room</span>
            </button>
            <button
              id="hangupBtn"
              disabled={this.state.isHangupBtnDisabled}
              onClick={() => this.hangup()}
            >
              <span>Hangup</span>
            </button>
            <button
              id="screenshareBtn"
              onClick={this.screenShare}
              disabled={this.state.isScreenShareButtonDisabled}
            >
              <span>
                {this.state.amISharingScreen ? 'Stop Sharing Screen' : 'Screen Share'}
              </span>

            </button>
          </div>

          <span id="currentRoom">{this.getRoomIdString()}</span>

          {this.showhideRoomDialog()}
        </div>
        <div
          id="videos"
          style={{ width: "73%", padding: 10, height: 500 }}
          className="videos_container"
        >
          <video
            id="localVideo"
            ref={this.localVideoRef}
            muted
            autoPlay
            playsInline
          ></video>
          <video
            id="remoteVideo"
            ref={this.remoteVideoRef}
            muted
            autoPlay
            playsInline
          ></video>
        </div>
        <div className="tabgrp">
          <TabGroup
            active={this.state.active}
            listOfMessages={this.state.listOfMessages}
            listOfFiles={this.state.listOfFiles}
            handleSendMessage={this.handleSendMessage}
            handleRequestFile={this.handleRequestFile}
            handleSendFileInformation={this.handleSendFileInformation}
            isDataChannelOpen={this.state.isDataChannelOpen}
            listOfParticipants={this.state.listOfParticipants}
            dataChannel={this.state.dataChannel}
          />
        </div>
        <BottomBar hangup={this.hangup} screenShare={this.screenShare} isScreenShareButtonDisabled={this.state.isScreenShareButtonDisabled} />
      </div>
    );
  }
}
export default NewWebrtc;
