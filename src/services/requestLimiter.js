export function createRequestLimiter(intervalMs) {
  let lastRequestAt = 0
  let queue = Promise.resolve()

  return async function waitForRequestSlot() {
    const slot = queue.then(async () => {
      const delay = intervalMs - (Date.now() - lastRequestAt)
      if (delay > 0) await new Promise((resolve) => setTimeout(resolve, delay))
      lastRequestAt = Date.now()
    })
    queue = slot.catch(() => {})
    await slot
  }
}
