//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
  apiKey: "AIzaSyCGBt_I2QwSgC_ZPhOjFLticf18ewCs1qY",
  authDomain: "videomeet-6d44c.firebaseapp.com",
  databaseURL: "https://videomeet-6d44c-default-rtdb.firebaseio.com",
  projectId: "videomeet-6d44c",
  storageBucket: "videomeet-6d44c.appspot.com",
  messagingSenderId: "116804159061",
  appId: "1:116804159061:web:0a3cb53888bb1ccd3776dc",
  measurementId: "G-LBD87LLZVL"
};
firebase.initializeApp(config);
var database = firebase.database().ref(); // gives you access to the root of your database
database.on('child_added', readMessage); // call readMessage as soon as another item is added to database

var yourId = Math.floor(Math.random()*1000000000); // randomly generated id to identify messages sent by yourself in the Firebase database

var yourpc, sendDataChannel, recvDataChannel, messageThreadHtml;

window.onload = function () {

	startConnection();

	messageThreadHtml = document.getElementById("message-thread");
	var sendButton = document.getElementById("send");
	var messageInput = document.getElementById("message-input");	

	// When the sendButton is clicked, send the text message via sendDataChannel
	sendButton.addEventListener("click", function (event) {
		var val = messageInput.value;
		console.log(val);

		messageThreadHtml.innerHTML += "send: " + val + "<br/>";
		sendDataChannel.send(val);
	})
}

function startConnection() {
	console.log('in startConnection');
	if (hasRtcConnection()){
		setupRtcConnection();
	}
	else {
		alert("Webrtc not supported");
	}
}

function hasRtcConnection() {
	// only one of the parts in the OR chain will be true for one browser
	window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection ||window.mozRTCPeerConnection; 
	window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription ||window.mozRTCSessionDescription; 
	window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate ||window.mozRTCIceCandidate; ''

	return !!window.RTCPeerConnection // !! is shorthand for bool cast
}

function setupRtcConnection() {
	console.log('in setupRtcConnection');
	
	// list of STUN and TURN servers to use
	// STUN servers do NAT traversal and procure a usable IP address.
	// TURN servers are used if STUN doesn't work out (because of restrictive firewalls and VPNs). They relay (middle man) the Webrtc traffic and hence are more expensive.
	var config = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'webrtc','username': 'websitebeaver@mail.com'}]};

	// create the Peer Connection 
	yourpc = new RTCPeerConnection(config);

	// whenever a new ICE candidate is created on your computer, send a string version of it to the callee's computer. * callee = the person you are talking to
	yourpc.onicecandidate = (
		event => event.candidate 
			? sendMessage(yourId, JSON.stringify({'ice': event.candidate}))
			: console.log("Sent All Ice") );

	// When data channel is added to the peer connection, call this function
	yourpc.ondatachannel = recvChannelCallback;

	openDataChannel();

	// create an offer and send it to the callee
	yourpc.createOffer() // this offer contains details about yourself
 .then(offer => yourpc.setLocalDescription(offer) )
 .then(() => sendMessage(yourId, JSON.stringify({'sdp': yourpc.localDescription})) ); // sending these details to the callee in SDP format

}

// Send Message to the Signalling Server (Message does not refer to text message)
function sendMessage(senderId, data) {
 var msg = database.push({ sender: senderId, message: data });
 msg.remove();
}

// Receive Message from the Signalling Server (Message does not refer to text message)
function readMessage(data) {
	var msg = JSON.parse(data.val().message);
	var sender = data.val().sender;

	if (sender != yourId) {

	 if (msg.ice != undefined)
		 yourpc.addIceCandidate(new RTCIceCandidate(msg.ice));

	 else if (msg.sdp.type == "offer")
		 yourpc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
		 .then(() => yourpc.createAnswer())
		 .then(answer => yourpc.setLocalDescription(answer))
		 .then(() => sendMessage(yourId, JSON.stringify({'sdp': yourpc.localDescription})));

	 else if (msg.sdp.type == "answer")
		 yourpc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
	}
};


function openDataChannel(){
	console.log('openDataChannel');

	// create data channel 
	sendDataChannel = yourpc.createDataChannel("my-message-channel", {'reliable':false});
	console.log(sendDataChannel);

	// event handlers
	sendDataChannel.onerror = function (error) {
		console.log("Data channel error", error);
	}

	// when text message is received, display it on the webpage //CHECK
	sendDataChannel.onmessage = function (event) {
		console.log("Got data channel message", event.data);

		messageThreadHtml.innerHTML += "recv1: " + event.data + "<br/>"
	}

	sendDataChannel.onopen = function () {
		sendDataChannel.send("Other person has connected");
	}

	sendDataChannel.onclose = function () {
		console.log("Data channel closed");
	}
}

// called when the data channel is created
function recvChannelCallback(event) {
	console.log('recvChannelCallback');

	// there is only one data channel and it is bidirectional. `recvDataChannel` is just a different name for the same channel. Having said that, not sure whether I should be setting event handlers again.
	recvDataChannel = event.channel;
	recvDataChannel.onmessage = onRecvMessageCallback;
	recvDataChannel.onopen = onRecvChannelStateChange;
	recvDataChannel.onclose = onRecvChannelStateChange;
}


// When a text message is received, display it on the webpage
function onRecvMessageCallback(event ) {
	console.log('onRecvMessageCallback')

	var msg;
	try{
		msg = JSON.parse(event.data);
		console.log(event.type);
	}
	catch(e) {
		msg = event.data;
	}
	messageThreadHtml.innerHTML += "recv2: " + msg + "<br/>";
}

function onRecvChannelStateChange() {
	console.log('onRecvChannelStateChange');
	console.log('recvDataChannel.readyState', recvDataChannel.readyState);

	if (recvDataChannel.readyState === 'open') {
		sendDataChannel = recvDataChannel;
	}
	else {
		var msg = "Other person has disconnected.";
		messageThreadHtml.innerHTML += "recv3: " + msg + "<br/>";
	}
}

