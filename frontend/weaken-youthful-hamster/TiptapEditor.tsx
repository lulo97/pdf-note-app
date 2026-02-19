import { Editor, Extension } from "@tiptap/core"
import { TextStyle } from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, useRef } from "react"

import "./tiptap.css"

const TabExtension = Extension.create({
  name: "tabExtension",

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        this.editor.commands.insertContent("    ") // 4 spaces
        return true // prevent default tab behavior (losing focus)
      }
    }
  }
})

const FontSize = Extension.create({
  name: "fontSize",

  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            }
          }
        }
      }
    ]
  }
})

type Props = {
  value: string
  onChange: (content: string) => void
}

export const TiptapEditor: React.FC<Props> = ({ value, onChange }) => {
  const isUpdatingFromOutside = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false
      }),
      Underline,
      TextStyle,
      FontSize,
      TabExtension
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      if (isUpdatingFromOutside.current) return
      onChange(editor.getHTML())
    }
  })

  // 🔥 Sync external value safely
  useEffect(() => {
    if (!editor) return

    const currentHTML = editor.getHTML()

    if (value !== currentHTML) {
      isUpdatingFromOutside.current = true
      editor.commands.setContent(value || "")
      isUpdatingFromOutside.current = false
    }
  }, [value, editor])

  if (!editor) return null

  return (
    <div
      style={{
        width: "100%",
        height: "55vh",
        display: "flex",
        flexDirection: "column"
      }}>
      <Toolbar editor={editor} />

      <div
        style={{
          flex: 1,
          minHeight: "100%",
          overflow: "auto"
        }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

type ToolbarProps = {
  editor: Editor
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  return (
    <div className="xp-toolbar">
      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        B
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()}>
        I
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
        U
      </button>
      <select
        onChange={(e) =>
          editor
            .chain()
            .focus()
            .setMark("textStyle", { fontSize: e.target.value })
            .run()
        }
        defaultValue="">
        <option value="">Size</option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="24px">24</option>
        <option value="32px">32</option>
      </select>
    </div>
  )
}
