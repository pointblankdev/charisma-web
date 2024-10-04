// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import CoinMarketCap from 'coinmarketcap-api'

const apiKey = '97a589da-791f-43bd-8b81-6d01cd304090'
const cmc = new CoinMarketCap(apiKey)

export default cmc