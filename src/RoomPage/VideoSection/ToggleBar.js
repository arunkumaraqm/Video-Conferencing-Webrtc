import React, { Component, useState } from "react";
import ChatSection from "./ChatSection/ChatSection";
import ParticipantsSection from "./ParticipantsSection/ParticipantsSection";
import styled from "styled-components";
import "../RoomPage.css";

const Tab = styled.button`
  font-size: 20px;
  padding: 10px 60px;
  cursor: pointer;
  opacity: 0.6;
  background: white;
  border: 0;
  outline: 0;
  ${({ active }) =>
    active &&
    `
    border-bottom: 2px solid black;
    opacity: 1;
  `}
`;
const ButtonGroup = styled.div`
  display: flex;
`;

function TabGroup(props) {
  let [active, setActive] = useState("Chat");
  // setActive(props.active);
  let listOfMessages = props.listOfMessages;
  let handleSendMessage = props.handleSendMessage;
  let isDataChannelOpen = props.isDataChannelOpen;
  let listOfParticipants = props.listOfParticipants;

  let fooBar = () => {
    console.log("MESMER", active);
    if (active === "Chat")
      return (
        <ChatSection
          listOfMessages={listOfMessages}
          handleSendMessage={handleSendMessage}
          disabled={!isDataChannelOpen}
        />
      );
    else if (active === "Participants")
      return (
        <ParticipantsSection
          listOfParticipants={listOfParticipants}
          handleSendMessage={handleSendMessage}
        />
      );
  };

  const types = ["Chat", "Participants"];
  return (
    <>
      <div className="toggling">
        <ButtonGroup>
          {types.map((type) => (
            <Tab
              key={type}
              active={active === type}
              onClick={() => {
                // console.log(type);
                setActive(type);
              }}
            >
              {type}
            </Tab>
          ))}
        </ButtonGroup>
      </div>
      {fooBar()}
    </>
  );
}

export default TabGroup;
