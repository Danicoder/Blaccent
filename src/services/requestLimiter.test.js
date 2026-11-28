import { afterEach, describe, expect, it, vi } from 'vitest'
import { createRequestLimiter } from './requestLimiter.js'

afterEach(() => {
  vi.useRealTimers()
})

describe('createRequestLimiter', () => {
  it('separa en al menos un segundo las solicitudes consecutivas', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(5000)
    const waitForSlot = createRequestLimiter(1000)
    await waitForSlot()

    let secondRequestStarted = false
    const secondRequest = waitForSlot().then(() => {
      secondRequestStarted = true
    })
    await vi.advanceTimersByTimeAsync(999)
    expect(secondRequestStarted).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await secondRequest
    expect(secondRequestStarted).toBe(true)
  })
})
