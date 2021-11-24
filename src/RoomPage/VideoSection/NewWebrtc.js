import React, {Component} from 'react';
import {config} from './config';
import firebase from '@firebase/app';
import '@firebase/firestore'
// const firebase = {
// 	initializeApp: initializeApp,
// 	firestore: firestore,
// }

var app = firebase.initializeApp({
	apiKey: "AIzaSyCGBt_I2QwSgC_ZPhOjFLticf18ewCs1qY",
	authDomain: "videomeet-6d44c.firebaseapp.com",
	databaseURL: "https://videomeet-6d44c-default-rtdb.firebaseio.com",
	projectId: "videomeet-6d44c",
	storageBucket: "videomeet-6d44c.appspot.com",
	messagingSenderId: "116804159061",
	appId: "1:116804159061:web:0a3cb53888bb1ccd3776dc",
	measurementId: "G-LBD87LLZVL"
});

class NewWebrtc extends Component {
	constructor(props){
		super(props);

		this.peerConnection = null;
		this.LocalVideoRef = React.createRef();
		this.localStream = null;
		this.remoteStream = null;
		this.state = {
			roomId: null,
			isCameraBtnDisabled: false,
			isCreateBtnDisabled: true,
			isJoinBtnDisabled: true,
			isHangupBtnDisabled: true
		}
		this.openUserMedia = this.openUserMedia.bind(this);
		this.createRoom = this.createRoom.bind(this);
		this.registerPeerConnectionListeners = this.registerPeerConnectionListeners.bind(this);
		this.getRoomIdString = this.getRoomIdString.bind(this);
	}

	async openUserMedia() {
		console.log('openusermedia called');
		const stream = await navigator.mediaDevices.getUserMedia(
			{ video: true, audio: true });
		this.localStream = stream;
		const localVideo = this.LocalVideoRef.current;
		localVideo.srcObject = stream; 
		localVideo.width = 320;
		localVideo.play();

		this.remoteStream = new MediaStream();

		// TODO add code for remote stream here

		this.setState({
			isCameraBtnDisabled: true,
			isCreateBtnDisabled: false,
			isJoinBtnDisabled: false,
			isHangupBtnDisabled: false
		})
	};

	async createRoom() {
		this.setState({
			isCreateBtnDisabled: true,
			isJoinBtnDisabled: true,
		});
		const db = firebase.firestore(app);
		const roomRef = await db.collection('rooms').doc();

		console.log('Create PeerConnection with configuration: ', config);
		this.peerConnection = new RTCPeerConnection(config);

		this.registerPeerConnectionListeners();

		this.localStream.getTracks().forEach(track => {
			this.peerConnection.addTrack(track, this.localStream);
		});

		// Code for collecting ICE candidates below
		const callerCandidatesCollection = roomRef.collection('callerCandidates');

		this.peerConnection.addEventListener('icecandidate', event => {
			if (!event.candidate) {
				console.log('Got final candidate!');
				return;
			}
			console.log('Got candidate: ', event.candidate);
			callerCandidatesCollection.add(event.candidate.toJSON());
		});
		// Code for collecting ICE candidates above

		// Code for creating a room below
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);
		console.log('Created offer:', offer);

		const roomWithOffer = {
			'offer': {
				type: offer.type,
				sdp: offer.sdp,
			},
		};
		await roomRef.set(roomWithOffer);
		this.setState({roomId: roomRef.id});
		console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);
		// Code for creating a room above

		this.peerConnection.addEventListener('track', event => {
			console.log('Got remote track:', event.streams[0]);
			event.streams[0].getTracks().forEach(track => {
				console.log('Add a track to the remoteStream:', track);
				this.remoteStream.addTrack(track);
			});
		});

	}

	registerPeerConnectionListeners() {
		this.peerConnection.addEventListener('icegatheringstatechange', () => {
			console.log(
				`ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
		});

		this.peerConnection.addEventListener('connectionstatechange', () => {
			console.log(`Connection state change: ${this.peerConnection.connectionState}`);
		});

		this.peerConnection.addEventListener('signalingstatechange', () => {
			console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
		});

		this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
			console.log(
				`ICE connection state change: ${this.peerConnection.iceConnectionState}`);
		});
	}

	getRoomIdString() {
		if (this.state.roomId)
			return <p>Current room is {this.state.roomId}. You are the caller.</p>
		else return <p></p>
	}

	render () {
		return <div className="new-webrtc">
			<div id="buttons">
				<button id="cameraBtn" disabled={this.state.isCameraBtnDisabled} onClick={() => this.openUserMedia()}>
					<span>Open camera & microphone</span>
				</button>
				<button id="createBtn" disabled={this.state.isCreateBtnDisabled} onClick={() => this.createRoom()}>
					<span>Create room</span>
				</button>
				<button id="joinBtn" disabled={this.state.isJoinBtnDisabled} onClick={() => null}>
					<span>Join room</span>
				</button>
				<button id="hangupBtn" disabled={this.state.isHangupBtnDisabled} onClick={() => null}>
					<span >Hangup</span>
				</button>
			</div>
			<span id="currentRoom"> 
			{ this.getRoomIdString() }
			</span>
			<div id="videos" style={{ width: 500, padding: 10 }}>
				<video id="localVideo" ref={this.LocalVideoRef} muted autoplay playsinline></video>
				<video id="remoteVideo" autoplay playsinline></video>
			</div>

		</div>
	}

}
export default NewWebrtc;