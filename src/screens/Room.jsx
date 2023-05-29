import React, { useCallback, useEffect, useState } from 'react'
import { useSocket } from '../context/SocketProvider';

const Room = () => {

  const [ remoteSocketId, setRemoteSocketId ] = useState(null);

  const socket = useSocket();
  const handleUserJoined = useCallback(({email, id}) => {
    console.log(`Email: ${email} joined the room`);
    setRemoteSocketId(id);
  }, [])

  useEffect(() => {
    socket.on('user:joined', handleUserJoined);
    return () => {
        socket.off('user:joined', handleUserJoined);
    }
  },[socket, handleUserJoined]);

  return (
    <div>
        <h1>Room</h1>
        <h4>{remoteSocketId ? "Connected" : "No one in room" }</h4>
    </div>
  )
}

export default Room;