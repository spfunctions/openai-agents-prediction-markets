import { describe, it, expect } from 'vitest'
import { predictionMarketFunctions, handleFunctionCall } from '../src/index.js'
describe('OpenAI functions', () => {
  it('exports 5 function definitions', () => {
    expect(predictionMarketFunctions).toHaveLength(5)
    expect(predictionMarketFunctions[0].function.name).toBe('get_world_state')
  })
  it('handleFunctionCall works for index', async () => {
    const result = await handleFunctionCall('get_uncertainty_index', {})
    const data = JSON.parse(result)
    expect(data.uncertainty).toBeGreaterThanOrEqual(0)
  }, 15000)
})
