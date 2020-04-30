import { SessionData, generateIndexJs } from '../src'

describe('generator tests', () => {
  it('should generate valid js for index.js', () => {
    console.log(
      generateIndexJs(require('./session/sessionData.json') as SessionData)
    )
  })
})
