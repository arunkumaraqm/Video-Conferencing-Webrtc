import React from "react";
import File from "./File";
import NewFile from "./NewFile";

const FileSharing = (props) => {
  return (
    <div className="chat_section_container">
      <File listOfFiles={props.listOfFiles} />
      <NewFile
        handleSendFile={props.handleSendFile}
        // disabled={props.disabled}
      />
    </div>
  );
};

export default FileSharing;
