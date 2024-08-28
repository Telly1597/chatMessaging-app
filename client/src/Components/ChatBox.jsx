import UserContext from "../UserContext";
import { useContext, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import "./ChatBox.css";
const ChatBox = ({ currentChat, updateChat, socket }) => {
  const { loggedInUser } = useContext(UserContext);

  const [messageInput, setMessageInput] = useState("");

  const handleMessageChange = (event) => {
    setMessageInput(event.target.value);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const params = {
      message: messageInput,
      user_id: loggedInUser._id,
      chat_id: currentChat._id,
      created:
        new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes(),
    };
    await socket.emit("send_message", params);
    setMessageInput("");
  };

  const findUsername = () => {
    const chatUser =
      currentChat.users[0]._id === loggedInUser._id
        ? currentChat.users[1].username
        : currentChat.users[0].username;
    return chatUser;
  };

  socket.on("receive_message", (message) => {
    updateChat(message);
  });


  return (
    <div id="chat-box">
      <div className="message-box">
        <ScrollToBottom className="scroll-to-bottom">
          <div className="message-container">
            <p style={{ textAlign: "center" }}> chat with {findUsername()} </p>
            {currentChat.messages.map((message, index) => {
              return (
                <div
                  className={
                    loggedInUser._id === message.user ? "you" : "other"
                  }
                  key={index}
                >
                  <p>{message.message}</p>
                  <p className="message-details">
                    {loggedInUser._id === message.user ? "You" : findUsername()}{" "}
                    {message.created}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollToBottom>
        <form id="message-input" onSubmit={sendMessage}>
          <div className="textarea-wrapper">
            <button type="submit" className="send-button">
              <span>Send</span> &#9658;
            </button>
            <textarea
              type="text"
              placeholder="Type message..."
              value={messageInput}
              onChange={handleMessageChange}
              className="message-input-txt"
            ></textarea>
          </div>
        </form>
      </div>
    </div>
  );
};
export default ChatBox;
