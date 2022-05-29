import React, { Component } from "react";
import SendFileButton from "../../resources/images/sendMessageButton.svg";

class FileSharing extends Component {
  constructor(props) {
    super();
    this.state = {
      listOfFiles: [],
      filename: "",
    };
    this.NewFile = this.NewFile.bind(this);
    this.Files = this.Files.bind(this);
    this.File = this.File.bind(this);
    this.handleSendFile = props.handleSendFile;
    this.handleSendFileInformation = props.handleSendFileInformation;
  }

  static getDerivedStateFromProps(props, state) {
    console.log("getDerivedStateFromProps method is called");
    return { listOfFiles: props.listOfFiles };
  }

  NewFile() {
    let fileInput = React.createRef();

    const sendFile = () => {
      this.handleSendFile(fileInput);
      this.setState({
        filename: "",
      });
    };

    const handleFileChange = (event) => {
      console.log(fileInput.current.files[0], "CARLOS");
      if (fileInput.current.files.length > 0)
        this.setState({
          filename: fileInput.current.files[0].name,
        });
    };
    // background color white for message container
    return (
      <div className="new_message_container" id="file">
        <input
          className="new_file_input"
          onChange={handleFileChange}
          // placeholder="Choose your file..."
          type="file"
          ref={fileInput}
          // disabled={props.disabled}
        />
        <button
          type="submit"
          className="new_message_button" // styles need to changed
          onClick={sendFile}
          // disabled={props.disabled}
          style={{ backgroundColor: "#f8e3df" }}
          //   props.disabled
          //     ? { backgroundColor: "#f8e3df" }
          //     : { backgroundColor: "white" }
        >
          <img src={SendFileButton} />
        </button>
      </div>
    );
  }

  File(key, author, content, sameAuthor, fileCreatedByMe) {
    const alignClass = fileCreatedByMe
      ? "message_align_right"
      : "message_align_left";

    const authorText = fileCreatedByMe ? "You" : author;

    const contentAdditionalStyles = fileCreatedByMe
      ? "message_right_styles"
      : "message_left_styles";
    console.log(
      key,
      author,
      content,
      sameAuthor,
      fileCreatedByMe,
      "everything"
    );

    return (
      <div className={`message_container ${alignClass}`}>
        {!sameAuthor && <p className="message_title">{authorText}</p>}
        <button
          className={`message_content ${contentAdditionalStyles}`}
          onClick={this.handleSendFileInformation(content)}
        >
          {content.name}
        </button>
      </div>
    );
  }

  //   renderFile: function (file) {
  //     return (
  //         <tr key={file.id}>
  //             <td>
  //                 <a href={file.url} download={file.name}>{file.name}</a>
  //             </td>
  //         </tr>
  //     );
  // }

  Files() {
    console.log(this.state.listOfFiles, "mobile phone");
    return (
      <div className="messages_container">
        <div>
          {this.state.listOfFiles.map((file, index) => {
            const sameAuthor =
              index > 0 &&
              file.identity === this.state.listOfFiles[index - 1].identity;
            return this.File(
              index,
              file.identity,
              file.content,
              sameAuthor,
              file.fileCreatedByMe
            );
          })}
        </div>
        <tr key={this.File.identity}>
          <td>
            <a href={this.File.content} download={this.File.name}>
              {this.File.name}
            </a>
          </td>
        </tr>
      </div>
    );
  }
  render() {
    return (
      <div className="chat_section_container">
        {this.Files()}
        {this.NewFile()}
      </div>
    );
  }
}

export default FileSharing;
