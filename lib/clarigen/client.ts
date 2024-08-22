import { ClarigenClient } from '@clarigen/core';
import { kraqenLottoContract } from './contracts';

const stacksApiUrl = 'https://stacks-node-api.mainnet.stacks.co';

export const clarigen = new ClarigenClient(stacksApiUrl);