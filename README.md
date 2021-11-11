# Build Steps
I am using Chromium but Google Chrome is fine too.

To test on one computer, the application must be opened on two different browsers (two tabs or two windows is not likely to work). 
Feed webcam video into one and fake video into another.

## Setting up server
- Install Web Server for Chrome extension on Chromium.
- Go to chrome://apps and open the Web Server for Chrome app.
- Open the project folder and start the server.
- Check `accessible on local network` and `automatically show index.html`.

## Fake video
- Install ffmpeg. 
- Take any small MP4 video (a few seconds). Run `ffmpeg -y -i video.mp4 -pix_fmt yuv420p video.y4m` to produce video.y4m.
- Open Chromium from the shell. `chromium --use-fake-device-for-media-stream --use-file-for-fake-video-capture=video.y4m`

## Webcam permissions
- Your browser will probably not let you enable webcam permissions for http.
- Go to about:flags and enable `Insecure origins treated as secure`
- Go to localhost:8887 (or the one listed in Web Server for Chrome popup).
- Click on the little button to the left of the address bar and enable mic and webcam permissions.
- Do this for both browsers.

## Video conference
- Go to localhost:8887 on both browsers.
- You should see caller's video on the left.
- Keep dev console open for observing the steps.
- Click on call button in one of the browsers.
- You should see callee's video on the right.



# Other Documentation
# Post 1
Most of this information is taken from *Getting Started with WebRTC* by Rob Manson.
## Architecture

![](https://3.bp.blogspot.com/-eVRO_vEmiiI/Veit9zFbx0I/AAAAAAAAI6w/9JP2urN-eRM/s1600/WebRTC.png)

## Flow of WebRTC
• Connect users
• Start signals
• Find candidates
• Negotiate media sessions
• Start RTCPeerConnection stream

### Connect users
For the two users to connect, the simplest option is that both the users visit the same website. This page can then identify each browser and connect both of them to a shared signaling server, using something like the WebSocket API.

### Start signals/Signalling
WebRTC does not specify how signalling should be done. Signalling is any form of communciation that helps the 2 browsers establish and control their WebRTC communication. Can be done using:

- a combination of XHR and the [Google AppEngine Channel API](https://developers.google.com/appengine/docs/python/channel/overview). 
- XHR polling
- [Server-Sent Events](http://www.html5rocks.com/en/tutorials/eventsource/basics/)
- [WebSockets](http://www.html5rocks.com/en/tutorials/websockets/basics/)

### Find Candidates/ICE Framework
The next step is for the two browsers to exchange information about their networks, and how they can be contacted. This process is commonly described as "finding candidates", and at the end each browser should be mapped to a directly accessible network interface and port. Each browser is likely to be sitting behind a router that may be using Network Address Translation (NAT) to connect the local network to the internet. Their routers may also impose firewall restrictions that block certain ports and incoming connections. Finding a way to connect through these types of routers is commonly known as NAT Traversal.

<hr> 

#### What is NAT?
NAT solves the problem of scarcity of IP addresses.
From Tannenbaum,
> The basic idea behind NAT is for the ISP to assign each home or business a single IP address (or at most, a small number of them) for Internet traffic.Within the customer network,every computer gets aunique IP address,which is used for routing intramural traffic.However,just before a packet exits the customer network and goes to the ISP, an address translation from the unique internal IP address to the shared public IP address takes place.

<hr>
<hr>

**STUN (Session Traversal Utilities for NAT)** helps in NAT traversal. A STUN server identifies how you can be contacted from the public internet and then returns this information in a useful form. There are a range of people that provide public STUN servers.

If the STUN server cannot find a way to connect to your browser from the public internet, you are left with no other option than to fall back to using a solution that relays your media, such as a **Traversal Using Relay NAT (TURN) server**. This effectively takes you back to a non peer-to-peer architecture, but in some cases, where you are inside a particularly strict private network, this may be your only option.

Within WebRTC, this whole process is usually bound into a single **Interactive Connectivity Establishment (ICE) framework** that handles connecting to a STUN server and then falling back to a TURN server where required.

### Negotiate Media Sessions
Now that both the browsers know how to talk to each other, they must also agree on the type and format of media (for example, audio and video) they will exchange including codec, resolution, bitrate, and so on. This is usually negotiated using an offer/answer based model, built upon the Session Description Protocol (SDP).

### Start RTCPeerConnection streams
Once this has all been completed, the browsers can finally start streaming media to each other, either directly through their peer-to-peer connections or via any media relay gateway they have fallen back to using.

## Peer to Peer Communication
Multiple computers come together and pool their resources to form a content distribution system. These computers are peers. There is no dedicated infrastructure like in a client-server architecture; no central point of control. P2P networks are self-scaling and faster.

# Post 2
[Following this tutorial "Insanely Simple WebRTC Video Chat Using Firebase (With Codepen Demo)"](https://websitebeaver.com/insanely-simple-webrtc-video-chat-using-firebase-with-codepen-demo).

- "Open this demo on another computer and press call on either computer" I only have one laptop; I hope this works on a phone.

- I found a [list of Turn servers](https://gist.github.com/sagivo/3a4b2f2c7ac6e1b5267c2f1f59ac6c6b) that I could use later.

- I did the Firebase setup

- The next step seems to be 

> Go ahead and create your own MediaStream object by opening a blank Chrome tab and opening Developer Tools. Then in the console enter the following:

```javascript
navigator.mediaDevices.getUserMedia({audio:true, video:true})
 .then(stream => console.log(stream));
```

I tried it on the `about:blank` page.

Error: `navigator` does not have a `mediaDevices`. 

[This seems to be the solution](https://stackoverflow.com/questions/34165614/navigator-mediadevices-getusermedia-is-not-working-and-neither-does-webkitgetuse) but I have not tried it and I do not know how to enable the flag for `about:blank`.

Edit: Works when I run it on the console of an https website with camera and mic pre-allowed.

# Post 3
[This post](https://gitlab.iotiot.in/interns-projects/webrtc/issues/2#note_41957) by Yogesh sir was insightful.

During the signalling phase,

Offer: Contains your (caller's) details that you send to the signalling server, which forwards it to the callee.

Answer: Contains callee's details that they send to the signalling server, which forwards it to you (the caller).
Both of these are in SDP format. 

During the communicating phase,
RTP protocol is used to exchange media like audio and video whereas SCTP protocol is used to exchange text messages.

## Doubts

What exactly is an ICE candidate? So far I've been assuming that when an application uses the ICE framework, the application becomes an ICE candidate. This caused a lot of confusion when I was reading the tutorial.

In the "Connecting" phase, why are they sent to the other client for checking and what is the need for verification?

What are certificates and fingerprints?

In section 6 of CodeLab tutorial, what are constraints? The `pcConstraint` is not explained anywhere.

# Post 4
<small>[Post on the last time I tried this.](https://gitlab.iotiot.in/interns-projects/webrtc/issues/5#note_42043)</small>

## Error: 

`Uncaught (in promise) TypeError: Cannot set property 'srcObject' of null at main.js:51`

This means that `yourVideo` is null. It was initialized at the beginning of the JS file. `var yourVideo = document.getElementById("yourVideo");`

When I try `document.getElementById("yourVideo")` in Developer Console, it does return the video element.

Context:

>Let’s skip to the showMyFace function. The code for this function is very short.
```
function showMyFace() {
 navigator.mediaDevices.getUserMedia({audio:true, video:true})
 .then(stream => yourVideo.srcObject = stream) // line 51
 .then(stream => pc.addStream(stream));
}
```
>When you call getUserMedia, your browser asks for permission to access your camera. This will return a MediaStream object, which you can set yourVideo.srcObject to. Those two lines show a video of you on your computer. Then you need to add that same MediaStream object to your PeerConnection object. Your friend needs to do the same. This function gets called as soon as the page loads, so you’ll see your face once you load the page.

~~Also, I'm not doing it on the Codepen website.~~ This error does not show up on Codepen.

Doubt: What does the Firebase database store?

# Post 5
## Error Resolved
Any code that depends on the body to be loaded should be in an anonymous function called on the event `window.onload`.

```javascript
window.onload = function () {
  var yourVideo = document.getElementById("yourVideo");
  console.log('yourVideo ', yourVideo)
  var friendsVideo = document.getElementById("friendsVideo");
}
```

To test the code, I might have to use another device since the webcam can only be used by one application at a time.

# Post 6
1. I'm not sure what Firebase does and why it is being used.
2. The code from the tutorial works on Codepen. I was able to make a call between my laptop and phone.
3. I'm not exactly sure where to make replacements in the tutorial code to achieve text messaging.
4. I tried to use a tutorial from [TutorialsPoint](https://www.tutorialspoint.com/webrtc/webrtc_text_demo.htm) for Webrtc text messaging. The code is readable but I am not able to run it. `server.js` uses port 9090. I have used the Web Server for Chrome extension for the clients (I'm not sure if that's what I'm supposed to do). A page with 'WebRTC Text Demo. Please sign in' shows up but the Sign In button doesn't do anything on clicking.
5. I feel like I need to tackle a smaller networking problem such as socket programming in Javascript as a prerequisite to this.

# Post 7
## Firebase 

A Firebase database server is used as the signalling server. You have to create a Firebase account and set up a new project. In the code, you have to import the Firebase Javascript library and use the credentials provided to your Firebase account.

## Steps 

![Insanely_Simple_WebRTC_Video_Chat_Using_Firebase__With_Codepen_Demo_](/uploads/b7b6c682ac6b75383d0cb584c933e6cd/Insanely_Simple_WebRTC_Video_Chat_Using_Firebase__With_Codepen_Demo_.jpg)

- Connect users - both users visit the same webpage
- Signalling - done using Firebase
- Finding Candidates - generated on your computer and communicated to other computer using offer/answer.
- Negotiate Media Sessions - also done using offer/answer.
- Start PC streams - steps 19, 20

## HTML
```html
 <body onload="showMyFace()">
 <video id="yourVideo" autoplay muted></video>
 <video id="friendsVideo" autoplay></video>
 <br />
 <button onclick="showFriendsFace()" type="button" class="btn btn-primary btn-lg"><span class="glyphicon glyphicon-facetime-video" aria-hidden="true"></span> Call</button>
 </body>
```
When the page loads, the webpage should be able to access your webcam and display the stream in the first video element. This is what showMyFace does. When you click on the Call button, a connection should be set up between you and the callee and their webcam stream must be displayed on the second video element. This is what showFriendsFace does.

## Code
```javascript
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

var yourVideo = document.getElementById("yourVideo");
console.log('yourVideo ', yourVideo)
var friendsVideo = document.getElementById("friendsVideo");

var yourId = Math.floor(Math.random()*1000000000); // randomly generated id

// list of STUN and TURN servers to use
// STUN servers do NAT traversal and procure a usable IP address.
// TURN servers are used if STUN doesn't work out (because of restrictive firewalls and VPNs). They relay (middle man) the Webrtc traffic and hence are more expensive.
var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'webrtc','username': 'websitebeaver@mail.com'}]};
var pc = new RTCPeerConnection(servers);

// whenever a new ICE candidate is created on your computer, send a string version of it to the callee's computer
pc.onicecandidate = (event => event.candidate?sendMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc.onaddstream = (event => friendsVideo.srcObject = event.stream);

function sendMessage(senderId, data) { // push the message onto the database
 var msg = database.push({ sender: senderId, message: data });
 msg.remove(); // TODO need to check what this does
}

function readMessage(data) {

 var msg = JSON.parse(data.val().message);
 var sender = data.val().sender;
 if (sender != yourId) { // If the added message is sent by you, you don't need to read it

   if (msg.ice != undefined)
     pc.addIceCandidate(new RTCIceCandidate(msg.ice));

   else if (msg.sdp.type == "offer") // this block is executed for the callee only
    // Remote description contains details of the computer your calling with. Set it to the details that it just sent over.
     pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
     .then(() => pc.createAnswer()) // this answer will contain your details
     .then(answer => pc.setLocalDescription(answer))
     .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription}))); // send your details to the other computer
  
   else if (msg.sdp.type == "answer") // this block is executed for the caller only
     pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
 }
};

database.on('child_added', readMessage); // any messages that are added to the database are read as soon as they come in

function showMyFace() {
    // retrieve audio and video stream from your device
 navigator.mediaDevices.getUserMedia({audio:true, video:true})
 .then(stream => yourVideo.srcObject = stream) // set the streams to the "yourVideo" element 
 .then(stream => pc.addStream(stream)); // add the streams to your peer connection object.
}

function showFriendsFace() {
 pc.createOffer() // this offer contains details about yourself
 .then(offer => pc.setLocalDescription(offer) )
 .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})) ); // sending these details to the callee in SDP format
}
```
