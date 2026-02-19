import { type CSSProperties } from "react"

export const xpContainer: CSSProperties = {
  width: "100%",
  minHeight: "90vh",
  padding: 8,
  boxSizing: "border-box",
  backgroundColor: "#ECE9D8",
  fontFamily: "Tahoma, sans-serif",
  border: "2px solid #0054E3",
  boxShadow: "inset -1px -1px 0 #000, inset 1px 1px 0 #fff"
}

export const xpTitleBar: CSSProperties = {
  background: "linear-gradient(to right, #0A246A, #3A6EA5)",
  color: "white",
  padding: "4px 8px",
  fontWeight: "bold",
  marginBottom: 8
}

export const xpInput: CSSProperties = {
  width: "90%",
  marginBottom: 10,
  padding: 4,
  backgroundColor: "white",
  borderTop: "2px solid #7F9DB9",
  borderLeft: "2px solid #7F9DB9",
  borderRight: "2px solid #fff",
  borderBottom: "2px solid #fff",
  fontFamily: "Tahoma, sans-serif"
}

export const xpTextarea: CSSProperties = {
  ...xpInput,
  height: "70%"
}

/**
 * Button must be a function because it depends on state
 */
export const xpButton = (isPressed: boolean): CSSProperties => ({
  padding: "4px 16px",
  backgroundColor: "#ECE9D8",
  borderTop: isPressed ? "2px solid #404040" : "2px solid #fff",
  borderLeft: isPressed ? "2px solid #404040" : "2px solid #fff",
  borderRight: isPressed ? "2px solid #fff" : "2px solid #404040",
  borderBottom: isPressed ? "2px solid #fff" : "2px solid #404040",
  fontFamily: "Tahoma, sans-serif",
  cursor: "pointer"
})
