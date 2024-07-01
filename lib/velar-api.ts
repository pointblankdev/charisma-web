const velarApi = {
    tokens: async (symbol = 'all') => {
        const response = await fetch(`https://api.velar.co/tokens/?symbol=${symbol}`)
        const data = await response.json();
        data.push({
            symbol: 'CHA',
            name: 'Charisma',
            contractAddress: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token',
            price: '1.0'
        })
        return data
    },
    tickers: async () => {
        const response = await fetch('https://api.velar.co/tickers')
        const data = await response.json();
        data.push({
            ticker_id: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx_SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token',
            base_currency: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx',
            target_currency: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token',
            last_price: 1,
        })
        return data
    }
};

export default velarApi;