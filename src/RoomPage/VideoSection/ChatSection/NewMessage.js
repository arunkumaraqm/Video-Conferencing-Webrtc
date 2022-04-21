import React, { useState } from "react";
import SendMessageButton from "../../../resources/images/sendMessageButton.svg";

const NewMessage = () => {
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
      handleSendMessage();
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
      <img
        className="new_message_button"
        src={SendMessageButton}
        onClick={sendMessage}
      />
    </div>
    {/* <div id="chat">
          {this.state.listOfTextMessages}
          <input
            type="text"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                this.setState({
                  listOfTextMessages:
                    this.state.listOfTextMessages +
                    [e.target.value.toUpperCase() + " "],
                });
                this.dataChannel.send(JSON.stringify(e.target.value));
                e.target.value = "/";
              }
            }}
          ></input>
        </div> */}
  );
};

export default NewMessage;
