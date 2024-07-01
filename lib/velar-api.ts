const velarApi = {
    tokens: async (symbol = 'all') => {
        return await (await fetch(`https://api.velar.co/tokens/?symbol=${symbol}`)).json();
    },
    tickers: async () => {
        const response = await fetch('https://api.velar.co/tickers')
        const data = await response.json();
        data.push({
            base_currency: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx',
            target_currency: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token',
            last_price: 1,
        }, {
            base_currency: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx',
            target_currency: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma',
            last_price: 1.1,
        })
        return data
    }
};

export default velarApi;