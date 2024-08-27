const velarApi = {
    tokens: async (symbol = 'all') => {
        const response = await fetch(`https://api.velar.co/tokens/?symbol=${symbol}`)
        const data = await response.json();

        if (symbol === 'all') {
            // proxy tokens
        }
        if (symbol === 'STX-wCHA') {
            data.push({ name: 'STX-wCHA', symbol: 'STX-wCHA', price: "0.00000117499" })
        }
        if (symbol === 'STX-sCHA') {
            data.push({ name: 'STX-sCHA', symbol: 'STX-sCHA', price: "0.00000124386" })
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