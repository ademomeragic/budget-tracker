import React, { useEffect, useState, useRef } from "react";
import "./FloatNotePanel.css";
import { fetchFloatNotes, createFloatNote, deleteFloatNote } from "../../api/api";

interface FloatNote {
  id: number;
  content: string;
  color: string;
  date: string;
  displayUntil: string;
}

export default function FloatNotePanel() {
  const [notes, setNotes] = useState<FloatNote[]>([]);
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#4ade80");
  const [displayUntil, setDisplayUntil] = useState<string>("");
  const [isMinimized, setIsMinimized] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 20, y: 20 });

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || isMinimized) return;

    const handleMouseDown = (e: MouseEvent) => {
      const shiftX = e.clientX - panel.getBoundingClientRect().left;
      const shiftY = e.clientY - panel.getBoundingClientRect().top;

      const moveAt = (pageX: number, pageY: number) => {
        pos.current = { x: pageX - shiftX, y: pageY - shiftY };
        panel.style.left = `${pos.current.x}px`;
        panel.style.top = `${pos.current.y}px`;
      };

      const onMouseMove = (e: MouseEvent) => moveAt(e.pageX, e.pageY);

      document.addEventListener("mousemove", onMouseMove);
      document.onmouseup = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.onmouseup = null;
      };
    };

    panel.addEventListener("mousedown", handleMouseDown);
    return () => {
      panel.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isMinimized]);

  const fetchNotes = async () => {
    try {
      const data = await fetchFloatNotes();
      setNotes(data);
    } catch (err) {
      console.error("❌ Failed to fetch FloatNotes", err);
    }
  };

  const handleCreate = async () => {
    if (!content.trim()) return;
    try {
      await createFloatNote({ content, color, displayUntil });
      setContent("");
      setColor("#4ade80");
      setDisplayUntil("");
      fetchNotes();
    } catch (err) {
      console.error("❌ Failed to create FloatNote", err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFloatNote(id);
      setNotes(notes.filter(note => note.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete FloatNote", err);
    }
  };

  return isMinimized ? (
    <div className="float-note-minimized" onClick={() => setIsMinimized(false)}>
      📝 FloatNotes
    </div>
  ) : (
    <div
      ref={panelRef}
      className="float-note-panel"
      style={{ position: "fixed", left: `${pos.current.x}px`, top: `${pos.current.y}px` }}
    >
      <div className="float-note-header">
        <h4>📝 FloatNotes</h4>
        <button className="minimize-btn" onClick={() => setIsMinimized(true)}>_</button>
      </div>
      <div className="note-list">
        {notes.map(note => (
          <div
            key={note.id}
            className="note-item"
            style={{ backgroundColor: note.color }}
          >
            <div className="note-text">{note.content}</div>
            <div className="note-meta">
              <span>
                {note.displayUntil
                  ? new Date(note.displayUntil).toLocaleDateString("en-GB", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })
                  : ""}
              </span>
              <button onClick={() => handleDelete(note.id)}>✖</button>
            </div>
          </div>
        ))}
      </div>
      <div className="note-input">
        <textarea
          placeholder="New note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <input
          type="date"
          value={displayUntil}
          onChange={(e) => setDisplayUntil(e.target.value)}
        />
        <button onClick={handleCreate}>Add</button>
      </div>
    </div>
  );
}
