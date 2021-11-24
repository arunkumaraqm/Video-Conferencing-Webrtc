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
		this.localVideoRef = React.createRef();
		this.remoteVideoRef = React.createRef();
		this.localStream = null;
		this.remoteStream = null;
		this.state = {
			roomId: null,
			isMeCaller: null,
			isCameraBtnDisabled: false,
			isCreateBtnDisabled: true,
			isJoinBtnDisabled: true,
			isHangupBtnDisabled: true,
			isRoomDialogVisible: false,
		}
		this.openUserMedia = this.openUserMedia.bind(this);
		this.createRoom = this.createRoom.bind(this);
		this.joinRoom = this.joinRoom.bind(this);
		this.hangup = this.hangup.bind(this);
		this.confirmJoin = this.confirmJoin.bind(this);
		this.cancelJoin = this.cancelJoin.bind(this);
		this.registerPeerConnectionListeners = this.registerPeerConnectionListeners.bind(this);
		this.joinRoomById = this.joinRoomById.bind(this);
		this.getRoomIdString = this.getRoomIdString.bind(this);
	}

	async openUserMedia() {
		console.log('openusermedia called');
		const stream = await navigator.mediaDevices.getUserMedia(
			{ video: true, audio: true });
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
			isMeCaller: true,
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

		roomRef.onSnapshot(async snapshot => {
			const data = snapshot.data();
			if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
				console.log('Got remote description: ', data.answer);
				const rtcSessionDescription = new RTCSessionDescription(data.answer);
				await this.peerConnection.setRemoteDescription(rtcSessionDescription);
			}
		});
		// Listening for remote session description above

		// Listen for remote ICE candidates below
		roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
			snapshot.docChanges().forEach(async change => {
				if (change.type === 'added') {
					let data = change.doc.data();
					console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
					await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
				}
			});
		});

	}


	async hangup() {
		const tracks = this.localStream.getTracks();
		tracks.forEach(track => {
			track.stop();
		});

		if (this.remoteStream) {
			this.remoteStream.getTracks().forEach(track => track.stop());
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
		})

		// Delete room on hangup
		if (this.state.roomId) {
			const db = firebase.firestore();
			const roomRef = db.collection('rooms').doc(this.state.roomId);
			const calleeCandidates = await roomRef.collection('calleeCandidates').get();
			calleeCandidates.forEach(async candidate => {
				await candidate.ref.delete();
			});
			const callerCandidates = await roomRef.collection('callerCandidates').get();
			callerCandidates.forEach(async candidate => {
				await candidate.ref.delete();
			});
			await roomRef.delete();
		}

		window.location.reload(true);

		
	}


	registerPeerConnectionListeners() {
		this.peerConnection.addEventListener('icegatheringstatechange', () => {
			console.log(
				`ICE gathering state changed: ${this.peerConnection.iceGatheringState}`);
		});

		this.peerConnection.addEventListener('connectionstatechange', () => {
			console.log(`Connection state change: ${this.peerConnection.connectionState}`);
			if (this.peerConnection.connectionState === 'disconnected' || this.peerConnection.connectionState == 'closed') this.hangup();
		});

		this.peerConnection.addEventListener('signalingstatechange', () => {
			console.log(`Signaling state change: ${this.peerConnection.signalingState}`);
		});

		this.peerConnection.addEventListener('iceconnectionstatechange ', () => {
			console.log(
				`ICE connection state change: ${this.peerConnection.iceConnectionState}`);
		});
	}

	async joinRoomById(givenRoomId) {
		const db = firebase.firestore();
		const roomRef = db.collection('rooms').doc(`${givenRoomId}`);
		const roomSnapshot = await roomRef.get();
		console.log('Got room:', roomSnapshot.exists);

		if (roomSnapshot.exists) {
			console.log('Create PeerConnection with configuration: ', config);
			this.peerConnection = new RTCPeerConnection(config);
			this.registerPeerConnectionListeners();
			this.localStream.getTracks().forEach(track => {
				this.peerConnection.addTrack(track, this.localStream);
			});

			// Code for collecting ICE candidates below
			const calleeCandidatesCollection = roomRef.collection('calleeCandidates');
			this.peerConnection.addEventListener('icecandidate', event => {
				if (!event.candidate) {
					console.log('Got final candidate!');
					return;
				}
				console.log('Got candidate: ', event.candidate);
				calleeCandidatesCollection.add(event.candidate.toJSON());
			});
			// Code for collecting ICE candidates above

			this.peerConnection.addEventListener('track', event => {
				console.log('Got remote track:', event.streams[0]);
				event.streams[0].getTracks().forEach(track => {
					console.log('Add a track to the remoteStream:', track);
					this.remoteStream.addTrack(track);
				});
			});

			// Code for creating SDP answer below
			const offer = roomSnapshot.data().offer;
			console.log('Got offer:', offer);
			await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
			const answer = await this.peerConnection.createAnswer();
			console.log('Created answer:', answer);
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
			roomRef.collection('callerCandidates').onSnapshot(snapshot => {
				snapshot.docChanges().forEach(async change => {
					if (change.type === 'added') {
						let data = change.doc.data();
						console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
						await this.peerConnection.addIceCandidate(new RTCIceCandidate(data));
					}
				});
			});
			// Listening for remote ICE candidates above
		}
	}

	async confirmJoin(givenRoomId) {
		console.log('given room id', givenRoomId);
		await this.joinRoomById(givenRoomId);
		console.log('Join room: ', this.state.roomId);

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
			return <p>Current room is '{this.state.roomId}'. You are the caller.</p>
		else if (this.state.roomId && ! this.state.isMeCaller)
			return <p>Current room is {this.state.roomId}. You are the callee.</p>
		else return <p></p>
	}

	showhideRoomDialog() {
		let givenRoomId = "";
		if (this.state.isRoomDialogVisible)
			return <div>
				<h2>Join room</h2>
				<div>
				Enter ID for room to join:
					<input type="text" id="room-id" onChange={(event) => givenRoomId = event.target.value}/>
				</div>

				<footer>
					<button type="button" onClick={()=> this.cancelJoin()}>
						<span>Cancel</span>
					</button>
					<button id="confirmJoinBtn" type="button" onClick={()=> this.confirmJoin(givenRoomId)}>
						<span>Join</span>
					</button>
				</footer>
			</div>
		else
			return <div></div>
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
				<button id="joinBtn" disabled={this.state.isJoinBtnDisabled} onClick={() => this.joinRoom()}>
					<span>Join room</span>
				</button>
				<button id="hangupBtn" disabled={this.state.isHangupBtnDisabled} onClick={() => this.hangup()}>
					<span >Hangup</span>
				</button>
			</div>

			<span id="currentRoom"> 
			{ this.getRoomIdString() }
			</span>

			<div id="videos" style={{ width: 500, padding: 10 }}>
				<video id="localVideo" ref={this.localVideoRef} muted autoplay playsinline></video>
				<video id="remoteVideo" ref={this.remoteVideoRef} muted autoplay playsinline></video>
			</div>
			{this.showhideRoomDialog()}

		</div>
	}

}
export default NewWebrtc;