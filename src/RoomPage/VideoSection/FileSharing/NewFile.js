import React, { useState } from "react";
import SendFileButton from "../../../resources/images/sendMessageButton.svg";

const NewFile = (props) => {
  const [file, setFile] = useState("");
  let datachannel = props.datachannel;
  let fileInput = React.createRef();
  const sendFile = () => {
    // send message to other user
    props.handleSendFile(fileInput.current.value);
    setFile("");
  };

  const handleKeyPressed = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // do not know what this does
      //sendMessage To other user
      props.handleSendFile(event.target.value);
      setFile("");
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.value);
  };
  // background color white for message container
  return (
    <div className="new_message_container" id="file">
      <input
        className="new_message_input"
        value={file}
        onChange={handleFileChange}
        // placeholder="Type your message..."
        type="file"
        onKeyDown={handleKeyPressed}
        ref={fileInput}
        // disabled={props.disabled}
      />
      {/* <button
        className=""
        src=
        onClick={sendMessage} // you have to do handleSendMessage here
      /> */}

      <button
        type="submit"
        className="new_message_button" // styles need to changed
        onClick={() => {
          var files = fileInput.current.files;
          console.log(fileInput);
          if (files.length > 0) {
            dataChannel.send(
              JSON.stringify({
                type: "start",
                content: JSON.stringify({
                  name: files[0].name,
                  filetype: files[0].type,
                }),
              })
            );
            console.log(files[0], files[0].name);
            sendFile(files[0], dataChannel);
          }
        }}
        // disabled={props.disabled}
        // style={
        //   props.disabled
        //     ? { backgroundColor: "#f8e3df" }
        //     : { backgroundColor: "white" }
        // }
      >
        <img src={SendFileButton} />
      </button>
    </div>
  );
};

export default NewFile;
