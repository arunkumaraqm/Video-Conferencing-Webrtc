import React, { useState } from "react";
import SendMessageButton from "../../../resources/images/sendMessageButton.svg";

const NewMessage = (props) => {
  const [message, setMessage] = useState("");
  let textInput = React.createRef();
  const sendMessage = () => {
    // send message to other user
    props.handleSendMessage(textInput.current.value);
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
  // background color white for message container
  return (
    <div className="new_message_container" id="chat">
      <input
        className="new_message_input"
        value={message}
        onChange={handleTextChange}
        placeholder="Type your message..."
        type="text"
        onKeyDown={handleKeyPressed}
        ref={textInput}
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
        onClick={sendMessage}
        disabled={props.disabled}
        style={
          props.disabled
            ? { backgroundColor: "#f8e3df" }
            : { backgroundColor: "white" }
        }
      >
        <img src={SendMessageButton} />
      </button>
    </div>
  );
};

export default NewMessage;
