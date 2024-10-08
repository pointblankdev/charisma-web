// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import CoinMarketCap from 'coinmarketcap-api'

const apiKey = process.env.CMC_API_KEY
const cmc = new CoinMarketCap(apiKey)

export default cmc