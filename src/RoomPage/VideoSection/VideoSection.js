import React from "react";

import VideoChat from './VideoChat'

class VideoSection extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      database: null,
      connectedUser: null,
      localStream: null,
      localConnection: null
    }
    this.userInfo = props.userInfo;
    this.localVideoRef = React.createRef()
    this.remoteVideoRef = React.createRef()
  }

  render() {
    return <VideoChat
      userInfo={this.userInfo}
      setLocalVideoRef={this.setLocalVideoRef}
    />
  }
}

export default VideoSection;

