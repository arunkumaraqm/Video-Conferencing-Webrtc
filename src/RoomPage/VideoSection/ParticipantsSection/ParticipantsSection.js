import React from "react";
import Participants from "./Participants";

const ParticipantsSection = (props) => {
  return (
    <div className="participants_section_container">
      <Participants listOfParticipants={props.listOfParticipants} />
    </div>
  );
};

export default ParticipantsSection;
