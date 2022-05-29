import React, { Component, useState } from "react";
import { config } from "./config";
import firebase from "@firebase/app";
import "@firebase/firestore";
import ParticipantsSection from "./ParticipantsSection/ParticipantsSection";
import ChatSection from "./ChatSection/ChatSection";
import BottomBar from "./BottomBar";
import TabGroup from "./ToggleBar";
import "../RoomPage.css";
import styled from "styled-components";
import { createRef } from "react";
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
    this.roomRef = null;
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

      active: "Chat",
      list: ["1", "300", "222"],
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
    this.acceptScreenshare = this.acceptScreenshare.bind(this);
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

  collectIceCandidates(callerOrCallee) {
    // accesses callerCandidates or calleeCandidates
    const CandidatesCollection = this.roomRef.collection(callerOrCallee + "Candidates");

    this.peerConnection.addEventListener("icecandidate", (event) => {
      if (!event.candidate) {
        console.log("Got final candidate!");
        return;
      }
      console.log("Got candidate: ", event.candidate);
      CandidatesCollection.add(event.candidate.toJSON());
    });
  }

  listenForRemoteSdp() {
    this.roomRef.onSnapshot(async (snapshot) => {

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
  }

  async composeAndSendOffer(){
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    console.log("Created offer:", offer);

    const roomWithOffer = {
      offer: {
        type: offer.type,
        sdp: offer.sdp,
      },
    };
    await this.roomRef.set(roomWithOffer);
  }

  async receiveOfferAndSendAnswer(){
    const roomSnapshot = await this.roomRef.get();
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
    await this.roomRef.update(roomWithAnswer);
    console.log(roomWithAnswer);
  }

  async enableScreensharing() {

    this.screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    var screenVideoTrack = this.screenStream.getVideoTracks()[0];
    var sender = this.peerConnection.getSenders().find(function (s) {
        return s.track.kind == screenVideoTrack.kind;
      });
    sender.replaceTrack(screenVideoTrack);

    // this.screenStream.getTracks().forEach(async (track) => {
    //   console.log(this.screenStream, this.screenStream.getTracks(), 'KEKOA');
    //   this.peerConnection.addTrack(track, this.screenStream);
    // });
    // this.collectIceCandidates('caller');
    // this.composeAndSendOffer()
      

    // const localScreenShare = this.localScreenShareRef.current;
    // localScreenShare.srcObject = this.screenStream;
    // localScreenShare.width = 320;
    // localScreenShare.play();

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

    this.setState({
      amISharingScreen: false
    })
  }

  async acceptScreenshare() {
    this.setState({
      isScreenShareAccepted: true
    })

    this.listenForRemoteSdp();    
    // this.listenForRemoteIceCandidates();


    // console.log('YUEtide now setting the local screen share ref with the video', this.screenStream, this.screenStream.getTracks());
    // console.log('YUEtid also', this.remoteStream.getTracks());
    // const localScreenShare = this.localScreenShareRef.current;
    this.remoteVideo.srcObject = this.screenStream; 
    this.remoteVideo.width = 900;
    // localScreenShare.play();
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
    this.roomRef = await db.collection("rooms").doc();

    this.setupConnection();

    this.localStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, this.localStream);
    });

    this.collectIceCandidates('caller');
    this.composeAndSendOffer()
    this.setState({ roomId: this.roomRef.id });
    console.log(`New room created with SDP offer. Room ID: ${this.roomRef.id}`);
    // Code for creating a room above


    this.peerConnection.addEventListener("track", (event) => {
      console.log("NILLY remote track:", event.streams, event.streams[0]);
      event.streams[0].getTracks().forEach((track) => {
        console.log("Add a track to the remoteStream:", track);
        this.remoteStream.addTrack(track);
      });

    });

    this.listenForRemoteSdp()
    this.listenForRemoteIceCandidates();
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
    });

    // Delete room on hangup
    if (this.state.roomId) {
      // don't need to do this again
      const db = firebase.firestore();
      this.roomRef = db.collection("rooms").doc(this.state.roomId);
      const calleeCandidates = await this.roomRef
        .collection("calleeCandidates")
        .get();
      calleeCandidates.forEach(async (candidate) => {
        await candidate.ref.delete();
      });
      const callerCandidates = await this.roomRef
        .collection("callerCandidates")
        .get();
      callerCandidates.forEach(async (candidate) => {
        await candidate.ref.delete();
      });
      await this.roomRef.delete();
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
      let currentFileMeta;
      let currentFile = [];
      receiveChannel.onmessage = (event) => {
        console.log(event.data, 'ULNA');
        let message = JSON.parse(event.data);

        switch (message.type) {
          case "chat":
            this.handleRecvMessage(message.content, message.identity);
            break;

          case "start":
            currentFile = [];
            console.log(message);
            currentFileMeta = message.content;
            console.log("Receiving file", currentFileMeta);
            this.setState({
              // add the message you sent to your chat thread
              listOfFiles: this.state.listOfFiles.concat([
                {
                  identity: this.userInfo.identity,
                  fileCreatedByMe: false,
                  content: currentFileMeta,
                },
              ]),
            });
            console.log(this.state.listOfFiles, "perth");
            break;

          case "filesharing":
            currentFile.push(atob(message.content));
            console.log("Progress on file sharing");
            break;

          case "end":
            console.log("Done with file sharing");
            this.saveFile(currentFileMeta, currentFile);
            console.log(this.state.listOfFiles, "yellow");
            break;

          case "filerequest":
            this.handleSendFile(message.content);
            break;

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

  handleRequestFile(content){
    this.dataChannel.send(JSON.stringify({
      content: content,
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

  listenForRemoteIceCandidates(){
    this.roomRef.collection("calleeCandidates").onSnapshot((snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  }

  async joinRoomById(givenRoomId) {
    const db = firebase.firestore();
    this.roomRef = db.collection("rooms").doc(`${givenRoomId}`);
    const roomSnapshot = await this.roomRef.get();
    console.log("Got room:", roomSnapshot.exists);

    if (roomSnapshot.exists) {
      console.log("Create PeerConnection with configuration: ", config);
      this.setupConnection();
      this.localStream.getTracks().forEach((track) => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      this.collectIceCandidates('callee');

      this.peerConnection.addEventListener("track", (event) => {
        if (this.state.isScreenShareAccepted){
          // accept screen share was pressed
          // whatever track is in event is the screen video
          console.log('EUREKA');
          console.log('Streams in screen share event', event.streams)
          event.streams[0].getTracks().forEach((track) => {
            console.log("Add a track to the screenStream:", track);
            this.screenStream.addTrack(track);
          })
          this.setState({
            isScreenShareAccepted: false
          })
        }
        else { 
            console.log('CAPRICE');
            console.log("Got remote track:", event.streams[0]);
            event.streams[0].getTracks().forEach((track) => {
            console.log("Add a track to the remoteStream:", track);
            this.remoteStream.addTrack(track);
          });
        }
      });

      this.receiveOfferAndSendAnswer()
      this.listenForRemoteIceCandidates();
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
                if (event.key == "Enter") {
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
      type: "chat",
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
    if (files.length > 0) {
      let jsontosend = {
        lastModified: files[0].lastModified,
        lastModifiedDate: files[0].lastModifiedDate,
        name: files[0].name,
        size: files[0].size,
        type: files[0].type,
        webkitRelativePath: files[0].webkitRelativePath
      }

      console.log(jsontosend, 'junny');

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
  handleSendFile(file) {
    sendFile(file.name, this.dataChannel);
  }

  render() {
    return (
      <div className="new-webrtc">
        {/* <div>
          <p> Parent</p>
          <input
            type="text"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                this.updatelist(event.target.value);
              }
            }}
          />

          {this.state.list.map((message, index) => {
            return <p>{message}</p>;
          })}

          {/* <Show list={this.state.list}></Show> */}
        {/* </div> */}
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
              onClick={() => { this.state.amISharingScreen ? this.disableScreensharing() : this.enableScreensharing()}}
              disabled={this.state.isScreenShareButtonDisabled}
            >
              <span>
                {this.state.amISharingScreen? 'Stop Sharing Screen': 'Screen Share'}
              </span>

            </button> 
            {/* <button
              id="screenshareacceptBtn"
              onClick={() => {this.acceptScreenshare()}}
              disabled={this.state.isViewStreamDisabled}
            >
              <span>View Stream</span>
            </button> */}
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

          {/* <video
            id="localScreenShare"
            ref={this.localScreenShareRef}
            muted
            autoPlay
            playsInline
          ></video> */}
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
        <BottomBar hangup={this.hangup} />

        {/* <div id="chat">
          {this.state.listOfMessages}
          <input
            type="text"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                this.setState({
                  listOfMessages:
                    this.state.listOfMessages +
                    [e.target.value.toUpperCase() + " "],
                });
                this.dataChannel.send(JSON.stringify(e.target.value));
                e.target.value = "/";
              }
            }}
          ></input>
        </div> */}
      </div>
    );
  }
}
export default NewWebrtc;
