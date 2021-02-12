import encyclopedia from "./encyclopedia"

async function start() {
  try {
    await encyclopedia()
  } catch(e) {
    console.log("error:", e)
  }
}
start()
