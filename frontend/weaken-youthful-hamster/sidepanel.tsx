import React, { useEffect, useState } from "react"

import { TiptapEditor } from "~TiptapEditor"

import { noteService } from "./api"
import { xpButton, xpContainer, xpInput, xpTitleBar } from "./style"

type FormState = {
  id?: number
  title: string
  content: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    console.log("[Debounce] value changed:", value)

    const handler = setTimeout(() => {
      console.log("[Debounce] updating debounced value:", value)
      setDebounced(value)
    }, delay)

    return () => {
      console.log("[Debounce] clearing timeout")
      clearTimeout(handler)
    }
  }, [value, delay])

  return debounced
}

const IndexSidePanel: React.FC = () => {
  console.log("🔥 IndexSidePanel render")

  const [state, setState] = useState<FormState>({
    title: "",
    content: ""
  })

  const [loading, setLoading] = useState(false)
  const [checkingTitle, setCheckingTitle] = useState(false)
  const [isUpdateMode, setIsUpdateMode] = useState(false)

  const debouncedTitle = useDebounce(state.title, 600)

  // Log state changes
  useEffect(() => {
    console.log("🧠 State updated:", state)
  }, [state])

  useEffect(() => {
    console.log("🔄 Mode changed. isUpdateMode:", isUpdateMode)
  }, [isUpdateMode])

  useEffect(() => {
    console.log("⏳ Loading:", loading)
  }, [loading])

  useEffect(() => {
    console.log("🔍 Checking title:", checkingTitle)
  }, [checkingTitle])

  // 🔥 CHECK TITLE EXISTS
  useEffect(() => {
    console.log("📌 Debounced title triggered:", debouncedTitle)

    if (!debouncedTitle.trim()) {
      console.log("⚠️ Empty title. Skipping check.")
      return
    }

    const checkTitle = async () => {
      console.log("🚀 Checking title in DB:", debouncedTitle)

      try {
        setCheckingTitle(true)

        const existing = await noteService.getByTitle(debouncedTitle)

        console.log("📥 API getByTitle result:", existing)

        if (existing) {
          console.log("✏️ Note exists. Switching to update mode.")

          setState({
            id: existing.id,
            title: existing.title,
            content: existing.content
          })

          setIsUpdateMode(true)
        } else {
          console.log("🆕 Note does not exist. Switching to create mode.")

          setIsUpdateMode(false)

          setState((prev) => ({
            ...prev,
            content: ""
          }))
        }
      } catch (error) {
        console.error("❌ Error checking title:", error)
      } finally {
        setCheckingTitle(false)
      }
    }

    checkTitle()
  }, [debouncedTitle])

  const handleChange = (type: "title" | "content", value: string) => {
    console.log(`📝 handleChange -> ${type}:`, value)

    setState((prev) => {
      const updated = { ...prev, [type]: value }
      console.log("🧠 Updated state will be:", updated)
      return updated
    })
  }

  const handleSave = async () => {
    console.log("💾 Save button clicked")
    console.log("📦 Current state before save:", state)

    if (!state.title.trim()) {
      console.warn("⚠️ Cannot save: title is empty")
      return
    }

    setLoading(true)

    try {
      if (isUpdateMode && state.id) {
        console.log("🔁 Updating note:", state.id)

        const result = await noteService.update(state.id, {
          title: state.title,
          content: state.content
        })

        console.log("✅ Update success:", result)
      } else {
        console.log("🆕 Creating new note")

        const result = await noteService.create({
          title: state.title,
          content: state.content
        })

        console.log("✅ Create success:", result)
      }
    } catch (err) {
      console.error("❌ Error saving note:", err)
      alert("Error saving note")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={xpContainer}>
      <div style={xpTitleBar}>My Note</div>

      <div>Title</div>
      <input
        value={state.title}
        style={xpInput}
        onChange={(e) => handleChange("title", e.target.value)}
      />

      {checkingTitle && <small>Checking title...</small>}

      <div>Content</div>

      <div
        style={{
          border: "1px inset #7F9DB9",
          height: "60vh",
          opacity: checkingTitle ? 0.5 : 1,
          pointerEvents: checkingTitle ? "none" : "auto",
          marginBottom: 10,
          background: "white"
        }}>
        <TiptapEditor
          value={state.content}
          onChange={(content) => handleChange("content", content)}
        />
      </div>

      <button
        disabled={loading || checkingTitle}
        style={xpButton(false)}
        onClick={handleSave}>
        {isUpdateMode ? "Update" : "Save"}
      </button>
    </div>
  )
}

export default IndexSidePanel
