import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";

export default function ChatWindow({ interestId, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const { token, user } = useAuthStore();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!interestId || !token) return;

    const newSocket = io("http://localhost:3000", {
      auth: { token },
    });

    setSocket(newSocket);

    const loadHistory = async () => {
      try {
        const { data } = await api.get(`/messages/${interestId}`);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    loadHistory();

    newSocket.emit("join_room", interestId);

    newSocket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on("error", (err) => {
      alert(err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [interestId, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;

    socket.emit("send_message", { interestId, content: input });
    setInput("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg h-150 max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
              <MessageSquare size={18} />
            </div>
            <h3 className="font-bold text-slate-900">Conversation</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Close Chat"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <MessageSquare size={40} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">No messages yet. Say hello!</p>
            </div>
          )}

          {messages.map((msg) => {
            const isSender = msg.senderId._id === user._id;
            return (
              <div
                key={msg._id}
                className={`flex ${isSender ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 text-sm shadow-sm ${
                    isSender
                      ? "bg-indigo-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-white text-slate-900 rounded-2xl rounded-bl-sm border border-slate-100"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  <span
                    className={`text-[10px] block mt-1.5 ${
                      isSender ? "opacity-80 text-right" : "text-slate-500"
                    }`}
                  >
                    {msg.senderId.name} •{" "}
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={sendMessage}
          className="p-4 border-t border-slate-100 flex gap-2 bg-white"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm text-slate-900 placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center shadow-sm"
            title="Send Message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
