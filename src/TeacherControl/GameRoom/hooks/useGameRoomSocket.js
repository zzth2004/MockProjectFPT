import { useState, useRef, useEffect, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:3000/game-room";

export default function useGameRoomSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [gameStatus, setGameStatus] = useState("IDLE");
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [logs, setLogs] = useState([
    { type: "info", msg: "Chào mừng! Chọn bài tập hoặc tạo mới, rồi nhấn Tạo phòng." }
  ]);

  const addLog = useCallback((msg, type = "info") => {
    const time = new Date().toLocaleTimeString("vi-VN");
    setLogs(prev => [...prev, { type, msg, time }]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const handleCreateRoom = useCallback((selectedEx) => {
    if (!selectedEx) {
      addLog("Chọn bài tập trước!", "error");
      return;
    }
    socketRef.current?.disconnect();

    addLog(`Kết nối ${SOCKET_URL}...`, "info");
    const sock = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = sock;

    let hasCreated = false;
    sock.on("connect", () => {
      setConnected(true);
      addLog(`✅ Socket ID: ${sock.id}`, "success");
      if (!hasCreated) {
        sock.emit("createRoom", { exerciseId: Number(selectedEx.id) });
        hasCreated = true;
      } else {
        addLog("⚠️ Kết nối lại thành công, nhưng phòng cũ đã bị hủy trên server do mất kết nối Host. Vui lòng tạo phòng mới.", "warn");
      }
    });

    sock.on("roomCreated", (d) => {
      setRoom(d);
      setGameStatus("LOBBY");
      setPlayers(Object.values(d.players || {}));
      addLog(`🎉 Phòng tạo xong! PIN: ${d.pin}`, "success");
    });

    sock.on("playerJoined", (d) => {
      setPlayers(d.leaderboard || []);
      addLog(`👤 Vào: ${d.player?.fullName || "Ẩn danh"}`, "info");
    });

    sock.on("playerLeft", (d) => {
      setPlayers(d.leaderboard || []);
      addLog("👤 Rời phòng.", "warn");
    });

    sock.on("updateLeaderboard", (d) => {
      setPlayers(d.leaderboard || []);
    });

    sock.on("gameStarted", () => {
      setGameStatus("PLAYING");
      addLog("▶️ Game bắt đầu!", "success");
    });

    sock.on("gameEnded", (d) => {
      setGameStatus("FINISHED");
      setPlayers(d.leaderboard || []);
      addLog("🏆 Game kết thúc!", "success");
    });

    sock.on("error", (e) => {
      addLog("❌ " + (e.message || JSON.stringify(e)), "error");
    });

    sock.on("disconnect", () => {
      setConnected(false);
      addLog("Mất kết nối.", "warn");
    });
  }, [addLog]);

  const handleStart = useCallback(() => {
    if (!room?.pin) return;
    socketRef.current?.emit("startGame", { pin: room.pin });
    addLog("▶️ startGame", "info");
  }, [room, addLog]);

  const handleEnd = useCallback(() => {
    if (!room?.pin) return;
    if (window.confirm("Kết thúc?")) {
      socketRef.current?.emit("endGame", { pin: room.pin });
    }
  }, [room]);

  const handleDisconnect = useCallback(() => {
    socketRef.current?.disconnect();
    setConnected(false);
    setRoom(null);
    setPlayers([]);
    setGameStatus("IDLE");
    addLog("🔌 Đã ngắt kết nối.", "info");
  }, [addLog]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    connected,
    gameStatus,
    room,
    players,
    logs,
    addLog,
    clearLogs,
    handleCreateRoom,
    handleStart,
    handleEnd,
    handleDisconnect,
  };
}
