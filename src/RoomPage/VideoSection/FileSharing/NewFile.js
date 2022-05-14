import React, { useState } from "react";
import SendFileButton from "../../../resources/images/sendMessageButton.svg";

const NewFile = (props) => {
  const [filename, setFileName] = useState("");
  let fileInput = React.createRef();

  const sendFile = () => {
    // send message to other user
    console.log('sending', 'DARKROOM');
    props.handleSendFile(fileInput);
    setFileName("");
  };

  const handleFileChange = (event) => {
    console.log(fileInput.current.files[0], 'CARLOS');
    if (fileInput.current.files.length>0)
      setFileName(fileInput.current.files[0].name);
  };
  // background color white for message container
  return (
    <div className="new_message_container" id="file">
      <input
        className="new_file_input"
        onChange={handleFileChange}
        // placeholder="Type your message..."
        type="file"
        ref={fileInput}
        // disabled={props.disabled}
      />
      <button
        type="submit"
        className="new_message_button" // styles need to changed
        onClick={sendFile}
        // disabled={props.disabled}
        // style={
        //   props.disabled
        //     ? { backgroundColor: "#f8e3df" }
        //     : { backgroundColor: "white" }
        // }
      >
        <img src={SendFileButton} />
      </button>
    </div>
  );
};

export default NewFile;

/***
 * {() => {
          var files = fileInput.current.files;
          console.log(fileInput);
          if (files.length > 0) {
            dataChannel.send(
              JSON.stringify({
                type: "start",
                content: JSON.stringify({
                  name: files[0].name,
                  filetype: files[0].type,
                }),
              })
            );
            console.log(files[0], files[0].name);
            sendFile(files[0], dataChannel);
          }
        }}
 */
