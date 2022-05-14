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

const File = ({ author, content, sameAuthor, fileCreatedByMe }) => {
  const alignClass = fileCreatedByMe
    ? "message_align_right"
    : "message_align_left";

  const authorText = fileCreatedByMe ? "You" : author;

  const contentAdditionalStyles = fileCreatedByMe
    ? "message_right_styles"
    : "message_left_styles";

  return (
    <div className={`message_container ${alignClass}`}>
      {!sameAuthor && <p className="message_title">{authorText}</p>}
      <p className={`message_content ${contentAdditionalStyles}`}>{content}</p>
    </div>
  );
};

const Files = (props) => {
  let listOfFiles = props.listOfFiles;

  return (
    <div className="messages_container">
      {listOfFiles.map((file, index) => {
        const sameAuthor =
          index > 0 && file.identity === listOfFiles[index - 1].identity;
        return (
          <File
            key={index}
            author={file.identity}
            content={file.content}
            sameAuthor={sameAuthor}
            fileCreatedByMe={file.fileCreatedByMe}
          />
        );
      })}
    </div>
  );
};

export default File;
