import React from "react";

// const dummyMessages = [
//   {
//     identity: "Achyut",
//     content: "Hello.",
//   },
//   {
//     identity: "Akhil",
//     content: "Do you need my help ?",
//   },
//   {
//     content: "All good",
//     messageCreatedByMe: true,
//     identity: "me",
//   },
//   {
//     content: "No help needed",
//     messageCreatedByMe: true,
//     identity: "me",
//   },
//   {
//     identity: "Arun",
//     content: "Hello guys",
//   },
//   {
//     identity: "Arun",
//     content: "No, I'm good.",
//   },
// ];

const Message = ({ author, content, sameAuthor, messageCreatedByMe }) => {
  const alignClass = messageCreatedByMe
    ? "message_align_right"
    : "message_align_left";

  const authorText = messageCreatedByMe ? "You" : author;

  const contentAdditionalStyles = messageCreatedByMe
    ? "message_right_styles"
    : "message_left_styles";

  return (
    <div className={`message_container ${alignClass}`}>
      {!sameAuthor && <p className="message_title">{authorText}</p>}
      <p className={`message_content ${contentAdditionalStyles}`}>{content}</p>
    </div>
  );
};

const Messages = (props) => {
  let listOfMessages = props.listOfMessages;
  return (
    <div className="messages_container">
      {listOfMessages.map((message, index) => {
        const sameAuthor =
          index > 0 && message.identity === listOfMessages[index - 1].identity;
        return (
          <Message
            key={index}
            author={message.identity}
            content={message.content}
            sameAuthor={sameAuthor}
            messageCreatedByMe={message.messageCreatedByMe}
          />
        );
      })}
    </div>
  );
};

export default Messages;
