import React from "react";
import Participants from "./Participants";
import ParticipantsLabel from "./ParticipantsLabel";

const ParticipantsSection = (props) => {
  return (
    <div className="participants_section_container">
      <ParticipantsLabel />
      <Participants listOfParticipants={props.listOfParticipants} />
    </div>
  );
};

export default ParticipantsSection;
