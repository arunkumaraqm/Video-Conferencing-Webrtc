# Build Steps

I am using Chromium but Google Chrome is fine too.

To test on one computer, the application must be opened on two different browsers (two tabs or two windows is not likely to work).
Feed webcam video into one and fake video into another.

## Setting up server for vanilla JS (LEGACY)

- Install Web Server for Chrome extension on Chromium.
- Go to chrome://apps and open the Web Server for Chrome app.
- Open the project folder and start the server.
- Check `accessible on local network` and `automatically show index.html`.

## Setting up server for node/react

- `npm start`

## Setting up server in Ubuntu for node/react

```bash
cd this directory
npm install
export NODE_OPTIONS=--openssl-legacy-provider
HOST=localhost npm start
```

## Fake video

### Generate Fake Video

- Install ffmpeg. - Take any small MP4 video (a few seconds). Run `ffmpeg -y -i video.mp4 -pix_fmt yuv420p video.y4m` to produce video.y4m.

### Open Chrome feeding it the fake video

- You can also download one such fake video from the releases in this repo.
- Open Chromium from the shell. `chrome --use-fake-device-for-media-stream --use-file-for-fake-video-capture="video.y4m"`

## Webcam permissions

- Your browser will probably not let you enable webcam permissions for http.
- Go to about:flags and enable `Insecure origins treated as secure`
- Go to localhost:8887 (or the one listed in Web Server for Chrome popup or the one listed in the npm start process).
- Click on the little button to the left of the address bar and enable mic and webcam permissions.
- Do this for both browsers.

## Video conference

- Go to localhost:8887 on both browsers.
- You should see caller's video on the left.
- Keep dev console open for observing the steps.
- Click on call button in one of the browsers.
- You should see callee's video on the right.

## To make the application run on LAN (Serving from Windows)

Go to Control Panel\System and Security\Windows Defender Firewall\Allowed applications and enable "change settings" then check private checkbox in Node.js row.

Use `npm start` to run application.

Find your local IP and the port that the application runs on in local host.

Once you have both the number after localhost from your URL and your local IP Address, you are ready to go to your other device. Open device’s browser and type in the IPv4 Address followed by a colon and then the port number. (192.168.x.x:3000)

# Debug

Whenever you're working solely on RoomPage, set DEBUG as true in NewWebrtc.js, else set it as false.
When true, you can use the buttons at the top directly and hangup reloads the page. When false, you can only access the Room page after going through JoinRoom page and hangup goes to the Introduction page.

# [More info about the backend](https://github.com/arunkumaraqm/Video-Conferencing-Webrtc/blob/videoconf/README.md)
