import React, { useState } from 'react';
import api from '../../api/api'; // adjust path as needed
import './chatWidget.css';

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    {
      role: 'assistant',
      content:
        'Hi! 👋 You can add a new goal by sending a message in this format:\n\n' +
        'add goal: Goal name; amount; startDate; endDate\n\n' +
        '📌 Example:\nadd goal: Buy a bike; 300; 2025-06-01; 2025-08-01'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const OPENROUTER_API_KEY = process.env.REACT_APP_OPENROUTER_API_KEY;

  const parseInput = async (text: string): Promise<string | null> => {
  const lower = text.toLowerCase();

  // ADD GOAL
  if (lower.startsWith('add goal:')) {
    try {
      const inputWithoutPrefix = text.split(':')[1].trim();
      const [goalName, amountStr, start, end] = inputWithoutPrefix.split(';').map(s => s.trim());

      if (!goalName || !amountStr || !start || !end) {
        return 'Format should be: add goal: Goal name; amount; startDate; endDate';
      }

      const targetAmount = parseFloat(amountStr);
      if (isNaN(targetAmount)) return 'Invalid amount format. Please use a number like 300.';

      const categoriesRes = await api.get('/category?type=expense');
      const walletsRes = await api.get('/wallet');
      const categoryId = categoriesRes.data[0]?.id;
      const walletId = walletsRes.data[0]?.id;

      if (!categoryId || !walletId) {
        return 'Missing category or wallet to create a goal.';
      }

      const newGoal = {
        name: goalName,
        categoryId,
        walletId,
        targetAmount,
        startDate: start,
        endDate: end,
        type: 'expense'
      };

      await api.post('/goal', newGoal);

      return `✅ Goal "${goalName}" created with amount ${targetAmount} from ${start} to ${end}.`;
    } catch (err) {
      console.error(err);
      return '❌ Failed to create goal. Format: add goal: name; amount; startDate; endDate';
    }
  }

  // DELETE GOAL
  if (lower.startsWith('delete goal:')) {
    try {
      const goalNameToDelete = text.split(':')[1].trim().toLowerCase();
      if (!goalNameToDelete) {
        return 'Please specify the goal name: delete goal: Goal name';
      }

      const goalsRes = await api.get('/goal');
      const allGoals = goalsRes.data;

      const goal = allGoals.find((g: any) => g.name.toLowerCase() === goalNameToDelete);

      if (!goal) {
        return `❌ No goal found with the name "${goalNameToDelete}".`;
      }

      await api.delete(`/goal/${goal.id}`);
      return `🗑️ Goal "${goal.name}" has been deleted.`;
    } catch (err) {
      console.error(err);
      return '❌ Failed to delete goal. Make sure the name is correct.';
    }
  }

  return null;
};

  const sendMessage = async () => {
  if (!input.trim()) return;

  setMessages(prev => [...prev, { role: 'user', content: input }]);
  setInput('');
  setLoading(true);

  const localReply = await parseInput(input);
  if (localReply) {
    setMessages(prev => [...prev, { role: 'assistant', content: localReply }]);
    setLoading(false);
    return;
  }

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
        messages: messages.concat({ role: 'user', content: input })
      })
    });

    const data = await response.json();
    const aiReply = data.choices?.[0]?.message;
    if (aiReply) {
      setMessages(prev => [...prev, aiReply]);
    }
  } catch (error) {
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: 'Error: Unable to get a response.' }
    ]);
  }

  setLoading(false);
};


  return (
    <>
      <button className="floating-chat-button" onClick={() => setChatOpen(!chatOpen)}>💬</button>
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
