import React from "react";

const SingleParticipant = ({ identity, lastItem }) => {
  const getParticipantName = (identity) => {
    return identity;
  };

  return (
    <>
      <p className="participants_paragraph">{getParticipantName(identity)}</p>
      {!lastItem && <span className="participants_separator_line"></span>}
    </>
  );
};

// const participants = [
//   {
//     identity: "Akhil",
//   },
//   {
//     identity: "Achyut",
//   },
//   {
//     identity: "Arun",
//   },
//   {
//     identity: "Justin",
//   },
// ];

const Participants = (props) => {
  let listOfParticipants = props.listOfParticipants;
  return (
    <div className="participants_container">
      {listOfParticipants.map((participant, index) => {
        return (
          <SingleParticipant
            key={participant.identity}
            identity={participant.identity}
            lastItem={listOfParticipants.length === index + 1}
          />
        );
      })}
    </div>
  );
};

export default Participants;
