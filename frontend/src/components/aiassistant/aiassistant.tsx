import React, { useState } from "react";
import { FiSend, FiMessageSquare } from "react-icons/fi";
import "./aiassistant.css";
import api from "../../api/api";

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setResponse("");
    setMessage("");
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.post("/chat/ask", { message });
      setResponse(res.data.response);
    } catch (err) {
      setResponse("❌ Error contacting AI assistant.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      {isOpen ? (
        <div className="chat-box">
          <div className="chat-header">
            <span>AI Assistant</span>
            <button onClick={toggleChat}>✕</button>
          </div>
          <div className="chat-body">
            <textarea
              rows={3}
              placeholder="Ask something about budgeting..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage} disabled={isLoading}>
              {isLoading ? "Thinking..." : <FiSend />}
            </button>
            {response && <div className="chat-response">{response}</div>}
          </div>
        </div>
      ) : (
        <button className="chat-toggle" onClick={toggleChat}>
          <FiMessageSquare size={24} />
        </button>
      )}
    </div>
  );
}
