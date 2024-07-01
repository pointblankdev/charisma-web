import velarApi from "./velar-api"

describe('Velar API', () => {
    const velar = velarApi
    it('should get all token data', async () => {
        const data = await velar.tokens('all')
        console.log(data)
    })
    it('should get welsh token data', async () => {
        const data = await velar.tokens('WELSH')
        console.log(data)
    })
    it('should get ticker token data', async () => {
        const data = await velar.tickers()
        console.log(data)
    })
})