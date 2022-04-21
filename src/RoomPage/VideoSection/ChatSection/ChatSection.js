import React from "react";
import ChatLabel from "./ChatLabel";
import Messages from "./Messages";
import NewMessage from "./NewMessage";

const ChatSection = (props) => {
  return (
    <div className="chat_section_container">
      <ChatLabel />
      <Messages listOfMessages={props.listOfMessages} />
      <NewMessage />
    </div>
  );
};

export default ChatSection;
