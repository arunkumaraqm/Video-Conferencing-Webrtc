import React from "react";
import ChatLabel from "./ChatLabel";
import Files from "./File";
import NewFIle from "./NewFile";

const FileSharing = (props) => {
  return (
    <div className="chat_section_container">
      {/* <ChatLabel /> */}
      <File listOfFiles={props.listOfFiles} />
      <NewFile
        handleSendFile={props.handleSendFile}
        disabled={props.disabled}
      />
    </div>
  );
};

export default ChatSection;
