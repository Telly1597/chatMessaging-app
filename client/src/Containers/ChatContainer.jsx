import { useState, useEffect, useContext } from "react";
import FriendsList from "../Components/FriendList";
import Chat from "../Components/ChatBox";
import Search from "../Components/Search";
import UserContext from "../UserContext";
import { useNavigate } from "react-router-dom";
import "./ChatContainer.css";

const ChatContainer = ({ socket, fetchChats }) => {
  const [friends, setFriends] = useState([]);
  const { loggedInUser, setLoggedInUser, chats, users } =
    useContext(UserContext);
  const navigate = useNavigate();

  const [currentChat, setCurrentChat] = useState({
    users: [],
    messages: [],
  });
  const [isDelete, setIsDelete] = useState(false);

  // return array of chats containing the logged in user
  const filteredChats = chats.filter((chat) => {
    return chat.users.findIndex((user) => user._id === loggedInUser._id) !== -1;
  });


  const addFriend = async (friend) => {
    const response = await fetch(
      `http://localhost:8000/addfriend/${loggedInUser._id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(friend),
      }
    );
    const friendData = await response.json();
    if (friendData && friendData.message) return;
    setLoggedInUser(friendData);
    setFriends(friendData.friends);
    const params = {
      user1_id: loggedInUser._id,
      user2_id: friend._id,
    };
    socket.emit("create_chat", params);
    fetchChats();
    setIsDelete(false);
  };

  const deleteFriend = async (friend) => {
    const response = await fetch(
      `http://localhost:8000/deletefriend/${loggedInUser._id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(friend),
      }
    );
    const updatedUser = await response.json();
    setLoggedInUser(updatedUser);
    setFriends(updatedUser.friends);
    deleteChat(friend);
    fetchChats();
    setIsDelete(true);
  };

  const deleteChat = async (friend) => {
    const chat = filteredChats.find((chat) => {
      return chat.users.findIndex((user) => user._id === friend._id) !== -1;
    });
    await fetch(`http://localhost:8000/chat/${chat._id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
  };

   useEffect(() => {
     if (filteredChats.length > 0 && currentChat.users.length === 0) {
       setCurrentChat(filteredChats[0]);
       socket.emit("join_chat", filteredChats[0]._id);
     }
   }, [filteredChats]);


  useEffect(() => {
    setFriends(loggedInUser.friends);
  }, [loggedInUser.friends]);

  useEffect(() => {
    fetchChats();
  }, [loggedInUser.friends.length, currentChat.messages]);

  const currentFriendChat = (friendChat) => {
    if (chats.findIndex((chat) => chat._id === friendChat._id) !== -1) {
      setIsDelete(false);
      setCurrentChat(friendChat);
      socket.emit("join_chat", friendChat._id);
      document.querySelector(".chat-container").classList.add("chat-open");
    } 
  };
  
  useEffect(() => {
    if (isDelete) {
      setCurrentChat({
        users: [],
        messages: [],
      });
    }
  }, [isDelete]);

  const filteredFriends = (searchedUser) => {
    setFriends(searchedUser);
  };

  const logOut = () => {
    setLoggedInUser();
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  const updateChat = (message) => {
    if (
      currentChat.messages.findIndex(
        (currentMessage) => currentMessage._id === message._id
      ) === -1
    ) {
      const updatedChat = { ...currentChat };
      updatedChat.messages.push(message);
      setCurrentChat(updatedChat);
    }
  };

  const goBackToList = () => {
    document.querySelector(".chat-container").classList.remove("chat-open");
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <div className="p-text">
          <p>Hi {loggedInUser.username} chat with your friends</p>
        </div>
      </header>
      <main>
        <Search filteredFun={filteredFriends} addFriend={addFriend} />
        <div className="chat-main">
          <div className="friend_list">
            <FriendsList
              friends={friends}
              filteredChats={filteredChats}
              currentFriendChat={currentFriendChat}
              deleteFriend={deleteFriend}
            />
          </div>
          <div className="chat_content">
            {currentChat && currentChat.users.length > 0 ? (
              <Chat
                socket={socket}
                currentChat={currentChat}
                updateChat={updateChat}
              />
            ) : (
              <></>
            )}
          </div>
        </div>
      </main>
      <div className="go-back-btn">
        <button onClick={goBackToList}>Go Back</button>
      </div>
      <div className="log-out-btn">
        <button onClick={logOut} alt="log out button">
          log out
        </button>
      </div>
    </div>
  );
};

export default ChatContainer;
