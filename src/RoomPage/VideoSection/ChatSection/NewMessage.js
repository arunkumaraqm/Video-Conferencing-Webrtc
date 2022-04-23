import React, { useState } from "react";
import SendMessageButton from "../../../resources/images/sendMessageButton.svg";

const NewMessage = (props) => {
  const [message, setMessage] = useState("");

  const sendMessage = () => {
    // send message to other user
    console.log(message);
    setMessage("");
  };

  const handleKeyPressed = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // do not know what this does
      //sendMessage To other user
      props.handleSendMessage(event.target.value);
      setMessage("");
    }
  };

  const handleTextChange = (event) => {
    setMessage(event.target.value);
  };

  return (
    <div className="new_message_container" id="chat">
      <input
        className="new_message_input"
        value={message}
        onChange={handleTextChange}
        placeholder="Type your message..."
        type="text"
        onKeyDown={handleKeyPressed}
      />
      {/* <img
        className="new_message_button"
        src={SendMessageButton}
        onClick={sendMessage}  // you have to do handleSendMessage here
      /> */}
    </div>
  );
};

export default NewMessage;
