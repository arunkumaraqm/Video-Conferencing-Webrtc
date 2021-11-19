# Post 1
## Text Chat using Firebase, Webrtc
### Reference
- *Learning WebRTC* by Dan Ristic

### Diagram
![Learning_WebRTC_Develop_interactive_real-time_communication_applications_with_WebRTC_by_Dan_Ristic__](/uploads/656f11905fa8c9ea530f82e94bd546ec/Learning_WebRTC_Develop_interactive_real-time_communication_applications_with_WebRTC_by_Dan_Ristic__.jpg)

### Steps
1. Signalling via Firebase server
2. Finding ICE Candidates
3. Setting up a Peer Connection.
4. Add data channel to this Peer Connection using `peerConnection.createDataChannel("myLabel", dataChannelOptions);` It returns a reference to the data channel object. [1]
5. Wait for dataChannel.onopen.
6. Send the message [2] using dataChannel.send(message).
7. The other peer can receive the message with the `dataChannel.onmessage` event handler. It can check the type of data using `isinstanceof`
8. Close data channel after exchange of messages. Then close the peer connection.


[1] You can create a data channel at any point in the process until the peer connection object is closed.
The data channel is in one of these states at any time: (i) connecting (default state; data channel waits for a connection), (ii) open, (iii) closing, (iv) closed.

When the other peer creates a channel, the peerConnection.ondatachannel event is fired. The data channel object itself has event handlers like onerror, onmessage, onopen, onclose

dataChannelOptions can include options such as reliable, ordered, maxRetransmitTime, etc that can be set. Most of them are for advanced usage.

[2] Data channel support String, Blob, ArrayBuffer, and ArrayBufferView types.

# Post 2
It appears that the data channel is set up but is not opening. I have tried (i) two browser approach with Web Server for Chrome extension (ii) two device approach [via Codepen](https://codepen.io/arunkumaraqm/pen/eYRWRvJ?editors=1111).

```
Uncaught InvalidStateError: Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel.readyState is not 'open'
```

Can you please create a default branch in the repository?

# Post 3
The data channel's readyState attribute is read only.

The problem seems to be with the approach itself. The Firebase tutorial only had one PeerConnection variable called pc referring to the peer connection of the peer that executes the code. The tutorial for video chat in *Learning WebRTC* by Dan Ristic has two PeerConnection variables, one for this peer and one for the other peer. This is a point of confusion.

Additionally, how do I set up a HTTPS connection so that I don't have to change browser flags? (Edit: You can't) The screenshot is of the popup from Web Server for Chrome extension.
![image](/uploads/46b4466454c0660c3a68f43f0e85caa0/image.png)

# Post 4
Works on shallow testing.

Reference: *WebRTC Blueprints* by Andrii Sergiienko Chapter 2 

What has been added:

1. On looking at the video chat code again, I realized I was missing the creation of offer, the sending of the offer to the singaling server, and the setting of `localDescription`s.
2. The callback functions, `hasRtcConnection` function, more statements in `setupRtcConnection` function.

## HTML
```html
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>Text Chat</title>
	<script src="https://www.gstatic.com/firebasejs/3.6.4/firebase.js"></script>
	<script src="main.js"></script>
 <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css" rel="stylesheet">
 <style type="text/css">
 	video {
 background-color: #ddd;
 border-radius: 7px;
 margin: 10px 0px 0px 10px;
 width: 320px;
 height: 240px;
}
button {
 margin: 5px 0px 0px 10px !important;
 width: 654px;
}
 </style>
</head>
<body> 

 <input type="text" name="message" id="message-input"></input>
 <button id="send">Send</button>
 <div id="message-thread"></div>

</body>
</html>
```

## JS

```js
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

```

# Post 5
## [Demo Video](/uploads/1d00346dca32693b2c5ee83e17606654/Text_Chat_Demo.mp4)

# Post 6

Note: Refer to my previous post for full code

### 0. Setting Up
Install the Web Server for Chrome extension. I have it installed on Chromium in my Ubuntu system. Open WSC and click on Open Folder. Open the project folder. Tick the box "enable on local network". You should have two URLS show up. One with the localhost address and another that can be accessed by any computer using the same network.

The HTML page should contain an input field, a send button and a display of the message thread. In `head`, load Firebase library and `main.js` and optionally load external Bootstrap.
```html
<body> 

 <input type="text" name="message" id="message-input"></input>
 <button id="send">Send</button>
 <div id="message-thread"></div>

</body>

```

### 1. Connecting Users
Open the URL in two different browsers or on two devices. Users visiting the same webpage are connected.

### 2. Signalling
Done via a Firebase database server. 

```javascript
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
```

```javascript
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
}
```


### 3. Finding Candidates
Setup an RTCPeerConnection and give it a list of STUN and TURN servers. ICE candidates are generated on both computers and are exchanged using offer/answer through the singaling server.
```javascript
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
```

Create a DataChannel and assign event handlers.
```javascript
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
```

### 4. Negotiate Sessions
Also done using offer/answer. The code for this is at the end of the `setupRtcConnection` function.

### 5. Clients can exchange messages
```javascript
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
```

## References:

1. WebRTC Blueprints by Andrii Sergiienko Chapter  2
2. Learning WebRTC by Dan Ristic
3. https://websitebeaver.com/insanely-simple-webrtc-video-chat-using-firebase-with-codepen-demo