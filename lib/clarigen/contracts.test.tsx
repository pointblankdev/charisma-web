import { clarigen } from "./client";
import { contractFactory } from '@clarigen/core';
import { contracts } from "./types";

describe('SIP9 interface', () => {
    it('should get last token id', async () => {
        const kraqenLottoContractId = 'SPGYCP878RYFVT03ZT8TWGPKNYTSQB1578VVXHGE.kraqen-lotto';
        const kraqenLottoContract = contractFactory(contracts.kraqenLotto, kraqenLottoContractId);
        const response = await clarigen.roOk(kraqenLottoContract.getLastTokenId());
        console.log(Number(response))
    })
})

describe('SIP13 interface', () => {
    it('should get number of lands', async () => {
        const landsContractId = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands';
        const landsContract = contractFactory(contracts.lands as any, landsContractId);
        const response = await clarigen.roOk(landsContract.getLastLandId());
        console.log(Number(response))
    })

    it('should get total supply of land id 1', async () => {
        const landsContractId = 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands';
        const landsContract = contractFactory(contracts.lands as any, landsContractId);
        const response = await clarigen.roOk(landsContract.getTotalSupply(1));
        console.log(Number(response))
    })
})