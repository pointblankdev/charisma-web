import { sendStx } from "../stacks-api"

describe('wallet API controls', () => {

  it('should transfer stx', async () => {
    const args = {
      password: String(process.env.STACKS_ORACLE_PASSWORD),
      seedPhrase: String(process.env.STACKS_ORACLE_SECRET_KEY),
      recipient: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
      amount: 1 * Math.pow(10, 6),
      fee: 10000
    }
    await sendStx(args)
  }, 200000)
})