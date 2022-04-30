import React, { useState } from "react";
import SendFileButton from "../../../resources/images/sendMessageButton.svg";

const NewFile = (props) => {
  const [file, setFile] = useState("");
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
    <div className="new_message_container" id="chat">
      <input
        className="new_message_input"
        value={file}
        onChange={handleTextChange}
        // placeholder="Type your message..."
        type="file"
        onKeyDown={handleKeyPressed}
        ref={fileInput}
        disabled={props.disabled}
      />
      {/* <button
        className=""
        src=
        onClick={sendMessage} // you have to do handleSendMessage here
      /> */}

      <button
        type="submit"
        className="new_message_button" // styles need to changed
        onClick={sendFile}
        disabled={props.disabled}
        style={
          props.disabled
            ? { backgroundColor: "#f8e3df" }
            : { backgroundColor: "white" }
        }
      >
        <img src={SendFileButton} />
      </button>
    </div>
  );
};

export default NewMessage;
