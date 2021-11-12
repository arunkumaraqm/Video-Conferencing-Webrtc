console.log('in main js');

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

window.onload = function () {
  var yourVideo = document.getElementById("yourVideo");
  console.log('yourVideo ', yourVideo)
  var friendsVideo = document.getElementById("friendsVideo");
}
var yourId = Math.floor(Math.random()*1000000000); // randomly generated id

// list of STUN and TURN servers to use
// STUN servers do NAT traversal and procure a usable IP address.
// TURN servers are used if STUN doesn't work out (because of restrictive firewalls and VPNs). They relay (middle man) the Webrtc traffic and hence are more expensive.
const servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'webrtc','username': 'websitebeaver@mail.com'}]};
var pc; // peer connection
initializePeerConnection();

function initializePeerConnection() {

  pc = new RTCPeerConnection(servers);

  // whenever a new ICE candidate is created on your computer, send a string version of it to the callee's computer
  pc.onicecandidate = (event => {
    if (event.candidate) 
      sendMessage(yourId, JSON.stringify({'ice': event.candidate}));
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
          (pc.connectionState == 'disconnected') ? notifyThatOtherPersonLeft('disconnected'): notifyThatOtherPersonLeft("ditched");
      }
  };
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
          .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
  
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

function showMyFace() {
    // retrieve audio and video stream from your device
 navigator.mediaDevices.getUserMedia({audio:true, video:true})
 .then(stream => yourVideo.srcObject = stream) // set the streams to the "yourVideo" element 
 .then(stream => pc.addStream(stream)); // add the streams to your peer connection object.
}

function showFriendsFace() {
   pc.createOffer()
   .then(offer => pc.setLocalDescription(offer) )
   .then(() => 
      sendMessage(
        yourId, 
        JSON.stringify({'sdp': pc.localDescription})
      )
    );
}

function toggleVideo(){
  let stream = yourVideo.srcObject;
  var vidTrack;
  for (const track of stream.getTracks()){
    if (track.kind == 'video')
    {
      vidTrack = track;
      break;
    }
  }
  vidTrack.enabled = !vidTrack.enabled;
}

function toggleAudio(){
  let stream = yourVideo.srcObject;
  var audioTrack;
  for (const track of stream.getTracks()){
    if (track.kind == 'audio')
    {
      audioTrack = track;
      break;
    }
  }
  audioTrack.enabled = !audioTrack.enabled;
}

function notifyThatOtherPersonLeft(displayMsg) {
  let elem = document.getElementById('errmsg');
  elem.innerHTML = '<p>Other person '+displayMsg+'.</p>';
}

function leaveCall(argument) {
  pc.close();
  sendMessage(
    yourId, 
    JSON.stringify({
      'sdp': pc.localDescription, 
      'leaving': true
    })
  );
}

