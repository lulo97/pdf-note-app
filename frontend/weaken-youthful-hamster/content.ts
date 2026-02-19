// import type { PlasmoCSConfig } from "plasmo"

// export const config: PlasmoCSConfig = {
//   matches: ["<all_urls>"],
//   all_frames: true
// }

// chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
//   console.log({ msg, sender, sendResponse })
// })

// function sendSelection() {
//   console.log("Run")
//   const selection = window.getSelection()?.toString().trim()
//   console.log(selection)
//   if (selection) {
//     chrome.runtime.sendMessage({
//       type: "TEXT_SELECTED",
//       payload: selection
//     })
//   }
// }

// // Listen when user finishes selecting text
// document.addEventListener("mouseup", sendSelection)
// document.addEventListener("keyup", sendSelection)
