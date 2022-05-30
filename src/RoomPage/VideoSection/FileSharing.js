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
    this.handleRequestFile = props.handleRequestFile;
    this.handleSendFileInformation = props.handleSendFileInformation;
    this.fileInput = React.createRef();

  }

  static getDerivedStateFromProps(props, state) {
    console.log("getDerivedStateFromProps method is called");
    return { listOfFiles: props.listOfFiles };
  }

  sendFileInformation = () => {
    this.handleSendFileInformation(this.fileInput);
    this.setState({
      filename: "",
    });
  };

  NewFile() {
    const handleFileChange = (event) => {
      console.log(this.fileInput.current.files[0], "CARLOS");
      if (this.fileInput.current.files.length > 0)
        this.setState({
          filename: this.fileInput.current.files[0].name,
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
          ref={this.fileInput}
          // disabled={props.disabled}
        />
        <button
          type="submit"
          className="new_message_button" // styles need to changed
          onClick={()=>{
            this.sendFileInformation();
            this.fileInput.current.value = "";
          }}
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

  File(idx, author, content, fileCreatedByMe) {
    const alignClass = fileCreatedByMe
      ? "message_align_right"
      : "message_align_left";

    const authorText = fileCreatedByMe ? "You" : author;

    const contentAdditionalStyles = fileCreatedByMe
      ? "message_right_styles"
      : "message_left_styles";
    console.log(content, 'HUMBLE');

    return (
      <div className={`message_container ${alignClass}`}>
        <p className="message_title">{authorText}</p>
        <button
          key={idx}
          className={`message_content ${contentAdditionalStyles}`}
          onClick={()=>{
            if (!fileCreatedByMe)
              this.handleRequestFile(this.state.listOfFiles[idx].content)
            console.log('PINATA', idx, this.state.listOfFiles[idx].content);
          }}
        >
          {content.name}
        </button>
      </div>
    );
  }

  Files() {
    console.log(this.state.listOfFiles, "mobile phone");
    return (
      <div className="messages_container">
        <div>
          {this.state.listOfFiles.map((file, index) => {
            return this.File(
              index,
              file.identity,
              file.content,
              file.fileCreatedByMe
            );
          })}
        </div>
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
