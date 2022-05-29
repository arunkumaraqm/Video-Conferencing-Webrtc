import React, { Component, useState } from "react";
import ChatSection from "./ChatSection/ChatSection";
import ParticipantsSection from "./ParticipantsSection/ParticipantsSection";
import FileSharing from "./FileSharing";
import styled from "styled-components";
import "../RoomPage.css";
import { render } from "@testing-library/react";
import reactRouterDom from "react-router-dom";

const Tab = styled.button`
  font-size: 15px;
  padding: 10px 40px;
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

class TabGroup extends React.Component {
  constructor(props) {
    super(props);
    // setActive(props.active);
    this.state = {
      active: "Chat",
      listOfFiles: [],
      listOfMessages: [],
      listOfParticipants: [],
      isDataChannelOpen: null,
    };
    this.handleRequestFile = props.handleRequestFile;
    this.handleSendFileInformation = props.handleSendFileInformation;
    this.handleSendMessage = props.handleSendMessage;
  }
  static getDerivedStateFromProps(props, state) {
    console.log("getDerivedStateFromProps method is called");
    return {
      listOfFiles: props.listOfFiles,
      listOfMessages: props.listOfMessages,
      listOfParticipants: props.listOfParticipants,
      isDataChannelOpen: props.isDataChannelOpen,
    };
  }
  fooBar() {
    console.log("MESMER", this.state.active);
    if (this.state.active === "Chat")
      return (
        <ChatSection
          listOfMessages={this.state.listOfMessages}
          handleSendMessage={this.handleSendMessage}
          disabled={!this.state.isDataChannelOpen}
        />
      );
    else if (this.state.active === "Participants")
      return (
        <ParticipantsSection
          listOfParticipants={this.state.listOfParticipants}
          handleSendMessage={this.handleSendMessage}
        />
      );
    else if (this.state.active === "File Sharing") {
      console.log(this.state.listOfFiles, "melbourne");
      return (
        <FileSharing
          listOfFiles={this.state.listOfFiles}
          handleRequestFile={this.handleRequestFile}
          handleSendFileInformation={this.handleSendFileInformation}
        />
      );
    }
  }
  render() {
    const types = ["Chat", "Participants", "File Sharing"];
    return (
      <>
        <div className="toggling">
          <ButtonGroup>
            {types.map((type) => (
              <Tab
                key={type}
                active={this.state.active === type}
                onClick={() => {
                  this.setState({
                    active: type,
                  });
                }}
              >
                {type}
              </Tab>
            ))}
          </ButtonGroup>
        </div>
        {this.fooBar()}
      </>
    );
  }
}

export default TabGroup;
