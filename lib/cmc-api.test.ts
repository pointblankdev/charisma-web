import cmc from './cmc-api'

describe('CMC API', () => {
  it('should get all token data', async () => {
    const { data } = await cmc.getQuotes({ symbol: ['ORDI'] })
    console.log(data.ORDI)
  })
})