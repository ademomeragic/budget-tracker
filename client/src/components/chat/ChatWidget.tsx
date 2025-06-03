import React, { useEffect, useRef, useState } from 'react';
import './chatWidget.css';

const ChatWidget = () => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are chatting with an AI.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: 'user', content: input }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "<YOUR_SITE_URL>",
          "X-Title": "<YOUR_SITE_NAME>",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528:free",
          messages: updatedMessages
        })
      });

      const data = await response.json();
      const aiReply = data.choices?.[0]?.message;

      if (aiReply) {
        setMessages([...updatedMessages, aiReply]);
      }
    } catch (error) {
      setMessages([...updatedMessages, { role: 'assistant', content: 'Error: Unable to get response.' }]);
    }

    setLoading(false);
  };

  return (
    <>
      <button className="floating-chat-button" onClick={() => setChatOpen(!chatOpen)}>
        💬
      </button>

      {chatOpen && (
        <div className="chat-container">
          <h3>AI Chat</h3>
          <div className="chat-box">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.role}`}>
                <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong> {msg.content}
              </div>
            ))}
            {loading && <div className="chat-message assistant">AI is typing...</div>}
          </div>
          <div className="chat-input">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..." 
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;