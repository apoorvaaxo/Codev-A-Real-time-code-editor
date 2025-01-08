import { useEffect, useState, useRef } from 'react';
import './App.css';
import io from 'socket.io-client';
import Editor from '@monaco-editor/react';
import { v4 as uuidv4 } from 'uuid';
import toast, { Toaster } from 'react-hot-toast';
import Peer from 'peerjs';

// Socket connection
const socket = io("http://localhost:5000");

const App = () => {
  // State variables
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("// write your code here!");
  const [copySuccess, setCopySuccess] = useState('');
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [peerId, setPeerId] = useState(null);
  const [showLocalVideo, setShowLocalVideo] = useState(true);
  const [showRemoteVideo, setShowRemoteVideo] = useState(true);
  const [theme, setTheme] = useState('dark');

  // Refs for video elements and peer
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);

  // Function to create a new room
  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidv4();
    setRoomId(id);
    toast.success('Room created successfully');
  };

  // Handling socket events for real-time collaboration
  useEffect(() => {
    socket.on("userJoined", (users) => {
      setUsers(users);
    });

    socket.on("codeUpdate", (newCode) => {
      setCode(newCode);
    });

    socket.on("userTyping", (user) => {
      setTyping(`${user} is typing`);
      setTimeout(() => {
        setTyping("");
      }, 2000);
    });

    socket.on("languageUpdate", (newLanguage) => {
      setLanguage(newLanguage);
    });

    return () => {
      socket.off("userJoined");
      socket.off("codeUpdate");
      socket.off("userTyping");
      socket.off("languageUpdate");
    };
  }, []);

  // Handling user leaving the room before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      socket.emit("leaveRoom");
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // PeerJS setup and stream handling
  useEffect(() => {
    const peer = new Peer();
    peer.on('open', id => {
      setPeerId(id);
      peerRef.current = peer;
    });

    peer.on('call', call => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play();
        call.answer(stream);
        call.on('stream', remoteStream => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });
      }).catch(err => {
        console.error('Failed to get local stream', err);
      });
    });

    return () => {
      peer.destroy();
    };
  }, []);

  // Joining room and emitting events
  const joinRoom = () => {
    if (!roomId || !userName || !peerId) {
      toast.error('Please provide Room ID, Username, and initialize PeerJS');
      return;
    }

    socket.emit("join", { roomId, userName, peerId });
    setJoined(true);
  };

  // Leaving room and resetting state
  const leaveRoom = () => {
    socket.emit("leaveRoom");
    setJoined(false);
    setRoomId("");
    setUserName("");
    setCode("// write your code here!");
    setLanguage("javascript");
  };

  // Copying room ID to clipboard
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopySuccess('Copied successfully');
    setTimeout(() => {
      setCopySuccess('');
    }, 2000);
  };

  // Handling code changes
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("codeChange", { roomId, code: newCode });
    socket.emit("typing", { roomId, userName });
  };

  // Handling language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    socket.emit("languageChange", { roomId, language: newLanguage });
  };

  // Handling Enter key press to join room
  const handleInputEnter = (e) => {
    if (e.code === 'Enter') {
      joinRoom();
    }
  };

  // Toggling theme between light and dark
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Apply theme to the body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Calling another user (PeerJS)
  const callUser = (peerId) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      const call = peerRef.current.call(peerId, stream);
      call.on('stream', remoteStream => {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play();
      });
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.play();
    }).catch(err => {
      console.error('Failed to get local stream', err);
    });
  };

  // Rendering UI when not joined
  if (!joined) {
    return (
      <div className='join-container'>
        <Toaster />
        <div className="join-form">
          <h1>Join Code Room</h1>
          <input
            type="text"
            placeholder="Room Id"
            value={roomId}
            onChange={e => setRoomId(e.target.value)}
            onKeyDown={handleInputEnter}
          />
          <input
            type="text"
            placeholder="Your Name"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            onKeyDown={handleInputEnter}
          />
          <button onClick={joinRoom} className='joinroom-button'>Join Room</button>
          <span className='createInfo'>
            Do not have an invite? Then create&nbsp;<a onClick={createNewRoom} href="http://localhost:5000/create" className='createNewBtn'>new room</a>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className='editor-container'>
      <Toaster />
      <div className="sidebar">
        <div>
          <img src="./codevsidelogofinal.png" alt="logo" width="190px" />
        </div>
        <div className="room-info">
          <h2>Code Room: {roomId}</h2>
          <button onClick={copyRoomId} className='copy-button'>Copy Room Id</button>
          {copySuccess && <span className='copy-success'>{copySuccess}</span>}
        </div>
        <h3 className='userintheroom'>Users in the room:</h3>
        <ul className='listofusers'>
          {users.map((user, index) => (
            <li key={index}>
              {user.userName}
              {user.peerId !== peerId && (
                <button onClick={() => callUser(user.peerId)} className='call-button'>Call</button>
              )}
            </li>
          ))}
        </ul>
        <p className='typing-indicator'>{typing}</p>
        <select
          className='language-selector'
          value={language}
          onChange={handleLanguageChange}
        >
          <option value="javascript">Javascript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="html">HTML</option>
        </select>
        <button className='leave-button' onClick={leaveRoom}>Leave Room</button>
      </div>

      <div className="editor-wrapper">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleCodeChange}
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          options={{
            minimap: { enabled: false },
            fontSize: 10,
          }}
        />
      </div>

      <div className="theme-toggle-btn">
        <input type="checkbox" id="theme-toggle" onChange={toggleTheme} />
        <label htmlFor="theme-toggle" className="slider round"></label>
      </div>

      <div className="video-container">
        {showLocalVideo && (
          <div className="video-wrapper">
            <video ref={localVideoRef} className="local-video" />
            <button className="close-video-btn" onClick={() => setShowLocalVideo(false)}>X</button>
          </div>
        )}

        {showRemoteVideo && (
          <div className="video-wrapper">
            <video ref={remoteVideoRef} className="remote-video" />
            <button className="close-video-btn" onClick={() => setShowRemoteVideo(false)}>X</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
