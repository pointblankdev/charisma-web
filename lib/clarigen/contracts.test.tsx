import { clarigen } from "./client";
import { kraqenLottoContract } from "./contracts";

describe('Contracts API', () => {
    it('should get last token id', async () => {
        const response = await clarigen.roOk(kraqenLottoContract.getLastTokenId());
        console.log(Number(response))
    })
})