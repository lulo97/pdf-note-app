import { useEffect, useRef, useState } from "react";

export default function Popup({ word, line, x, y, onClose }) {
  const popupRef = useRef(null);
  const textareaRef = useRef(null);

  const [note, setNote] = useState("");
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(false);

  const VIEWPORT_PADDING = 32;
  const [position, setPosition] = useState({ top: y, left: x });

  // -----------------------------------
  // Load existing note if exists
  // -----------------------------------
  useEffect(() => {
    if (!word) return;

    const fetchNote = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/notes`);
        const data = await res.json();

        const existing = data.find((item) => item.text === word);

        if (existing) {
          setNote(existing.note || "");
          setRecordId(existing.id);
        } else {
          setNote("");
          setRecordId(null);
        }
      } catch (err) {
        console.error("Error loading note:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [word]);

  // -----------------------------------
  // Close when clicking outside
  // -----------------------------------
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Autofocus
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Position logic
  useEffect(() => {
    if (!popupRef.current) return;

    const rect = popupRef.current.getBoundingClientRect();
    const popupWidth = rect.width;
    const popupHeight = rect.height;

    const maxLeft = window.innerWidth - popupWidth - VIEWPORT_PADDING;
    const maxTop = window.innerHeight - popupHeight - VIEWPORT_PADDING;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    let computedLeft = x;
    let computedTop = y;

    if (y + popupHeight > window.innerHeight - VIEWPORT_PADDING) {
      computedTop = y - popupHeight - VIEWPORT_PADDING;
    }

    computedLeft = clamp(computedLeft, VIEWPORT_PADDING, maxLeft);
    computedTop = clamp(computedTop, VIEWPORT_PADDING, maxTop);

    setPosition({ top: computedTop, left: computedLeft });
  }, [x, y]);

  if (!word) return null;

  // -----------------------------------
  // Save logic (CREATE or UPDATE)
  // -----------------------------------
  const handleSave = async () => {
    try {
      const payload = {
        text: word, // 🔥 important fix
        note: note,
      };

      if (recordId) {
        // UPDATE
        await fetch(`/notes/${recordId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE
        const res = await fetch(`/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        setRecordId(data.id);
      }

      onClose();
    } catch (err) {
      console.error("Error saving note:", err);
    }
  };

  return (
    <div
      ref={popupRef}
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
        zIndex: 1000,
        width: "800px",
        fontSize: "18px",
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        ✕
      </button>

      <div style={{ marginBottom: "12px" }}>
        <strong>Selected Word:</strong>
        <div style={{ marginTop: "4px", color: "#2563eb" }}>{word}</div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <strong>Full Line:</strong>
        <div
          style={{
            marginTop: "4px",
            background: "#f3f4f6",
            padding: "8px",
            borderRadius: "6px",
          }}
        >
          {line}
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <strong>Add Note:</strong>
        <textarea
          ref={textareaRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your note here..."
          style={{
            width: "100%",
            height: "200px",
            marginTop: "6px",
            padding: "8px",
            borderRadius: "6px",
            border: "1px solid #d1d5db",
            resize: "none",
            fontSize: "16px",
          }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          background: "#2563eb",
          color: "#ffffff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {recordId ? "Update Note" : "Save Note"}
      </button>
    </div>
  );
}
