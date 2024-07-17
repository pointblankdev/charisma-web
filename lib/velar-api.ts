const velarApi = {
    tokens: async (symbol = 'all') => {
        const response = await fetch(`https://api.velar.co/tokens/?symbol=${symbol}`)
        const data = await response.json();

        if (symbol === 'all') {
            data.push({
                symbol: 'sROCK',
                name: 'Liquid Staked Rock',
                contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-rock',
                price: data.find((token: any) => token.symbol === 'ROCK')?.price,
                decimal: 'u6',
            })
            data.push({
                symbol: 'sPEPE',
                name: 'Liquid Staked Pepe',
                contractAddress: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-pepe',
                price: data.find((token: any) => token.symbol === 'PEPE')?.price,
                decimal: 'u3',
            })
        }
        return data
    },
    tickers: async () => {
        const response = await fetch('https://api.velar.co/tickers')
        const data = await response.json();
        return data
    }
};

export default velarApi;