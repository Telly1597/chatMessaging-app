import { useEffect, useState } from "react";
import UserContext from "../UserContext";
import ChatContainer from "./ChatContainer";
import UserContainer from "./UserContainer";
import io from "socket.io-client";
import { Routes, Route, useNavigate } from "react-router-dom";

const AppContainer = () => {
 const [loggedInUser, setLoggedInUser] = useState(() => {
   // Initialize state with the value from localStorage, if available
   const savedUser = localStorage.getItem("loggedInUser");
   return savedUser ? JSON.parse(savedUser) : null;
 });

 const navigate = useNavigate();
   
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  

  const socket = io.connect("http://localhost:8000");

  const fetchUsers = async () => {
    const response = await fetch("http://localhost:8000/user");
    const userData = await response.json();
    setUsers(userData);
  };

  const fetchChats = async () => {
    const response = await fetch("http://localhost:8000/chat");
    const chatData = await response.json();
    setChats(chatData);
  };

  const addUser = async (newUser) => {
    const response = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    const savedUser = await response.json();
    setUsers([...users, savedUser]);
  };


  useEffect(() => {
    const handlePopState = (event) => {
      if (loggedInUser) {
        // Clear logged-in user and redirect
        setLoggedInUser(null);
        localStorage.removeItem("loggedInUser");
        navigate("/");
      }
    };

    // Push the initial state to the history stack
    window.history.pushState(null, null, window.location.pathname);

    // Listen to the popstate event
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [loggedInUser, navigate]);

   

  useEffect(() => {
    fetchUsers();
    fetchChats();
  }, []);

  return loggedInUser && loggedInUser.username ? (
    // if logged in, open chat page
    <UserContext.Provider
      value={{ loggedInUser, users, chats, setLoggedInUser }}
    >
      <Routes>
        <Route
          path="/chat"
          element={<ChatContainer socket={socket} fetchChats={fetchChats} />}
        />
      </Routes>
    </UserContext.Provider>
  ) : (
    // else,
    <UserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      <UserContainer addUser={addUser} />
    </UserContext.Provider>
  );
};

export default AppContainer;
