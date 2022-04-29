import React, { Component } from "react";
import styled from "styled-components";
TabGroup() {
    const types = ["Chat", "Participants"];
    return (
      <>
        <ButtonGroup>
          {types.map((type) => (
            <Tab
              key={type}
              active={this.state.active === type}
              onClick={() => {
                // console.log(type);
                this.state.active = type;
              }}
            >
              {type}
            </Tab>
          ))}
        </ButtonGroup>
        {this.fooBar()}
      </>
    );
  }
  fooBar() {
    console.log(this.state.active);
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
  }