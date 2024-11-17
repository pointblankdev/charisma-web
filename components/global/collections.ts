// Define collection metadata
export const COLLECTIONS = [
  {
    id: 'odins-raven',
    name: "Odin's Ravens",
    contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven'
  },
  {
    id: 'spell-scrolls',
    name: 'Spell Scrolls',
    contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.spell-scrolls-fire-bolt'
  },
  {
    id: 'pixel-rozar',
    name: 'Pixel Rozar',
    contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.pixel-rozar'
  },
  {
    id: 'welsh-punk',
    name: 'Welsh Punk',
    contract: 'SP1C2K603TGWJGKPT2Z3WWHA0ARM66D352385TTWH.welsh-punk'
  },
  // {
  //   id: 'bitgear-genesis',
  //   name: 'Bitgear Genesis',
  //   contract: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.bitgear-genesis'
  // },
  {
    id: 'memobots',
    name: 'Memobots: Guardians',
    contract: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.memobots-guardians-of-the-gigaverse'
  },
  {
    id: 'cultured-welsh-chromie',
    name: 'Cultured Welsh: Chromie',
    contract: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-chromie'
  },
  {
    id: 'cultured-welsh-grant',
    name: 'Cultured Welsh: Grant',
    contract: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-grant'
  },
  {
    id: 'weird-welsh',
    name: 'Weird Welsh',
    contract: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ.weird-welsh'
  },
  {
    id: 'treasure-hunters',
    name: 'Treasure Hunters',
    contract: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ.treasure-hunters'
  },
  {
    id: 'jumping-pupperz',
    name: 'Jumping Pupperz',
    contract: 'SP3T1M18J3VX038KSYPP5G450WVWWG9F9G6GAZA4Q.jumping-pupperz'
  },
  {
    id: 'mooning-sharks',
    name: 'Mooning Sharks',
    contract: 'SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.mooningsharks'
  },
  {
    id: 'stacks-invaders',
    name: 'Stacks Invaders',
    contract: 'SPV8C2N59MA417HYQNG6372GCV0SEQE01EV4Z1RQ.stacks-invaders-v0'
  },
  {
    id: 'happy-welsh',
    name: 'Happy Welsh',
    contract: 'SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG.happy-welsh'
  },
  {
    id: 'SP2RNHHQDTHGHPEVX83291K4AQZVGWEJ7WCQQDA9R.giga-pepe-v2',
    name: 'Giga Pepe v2',
    expectedPrice: '60-120'
  },
  {
    id: 'SP2RNHHQDTHGHPEVX83291K4AQZVGWEJ7WCQQDA9R.tremp-nfts',
    name: 'Tremp',
    expectedPrice: '60-120'
  }
] as any[];

// Collections that support the required token traits
export const COLLECTIONS_BY_ARTIST = {
  'rozar.btc': {
    address: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS',
    collections: [
      {
        id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.odins-raven',
        name: "Odin's Ravens",
        expectedPrice: '350-500'
      },
      {
        id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.spell-scrolls-fire-bolt',
        name: 'Spell Scrolls',
        expectedPrice: '10-20'
      },
      {
        id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.pixel-rozar',
        name: 'Pixel Rozar',
        expectedPrice: '1-5'
      },
      {
        id: 'SP1C2K603TGWJGKPT2Z3WWHA0ARM66D352385TTWH.welsh-punk',
        name: 'Welsh Punk',
        expectedPrice: '10-100'
      },
      {
        id: 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.bitgear-genesis',
        name: 'Bitgear Genesis',
        expectedPrice: '150-300'
      }
    ]
  },
  GPSC: {
    address: 'SP2RNHHQDTHGHPEVX83291K4AQZVGWEJ7WCQQDA9R',
    collections: [
      {
        id: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.memobots-guardians-of-the-gigaverse',
        name: 'Memobots: Guardians',
        expectedPrice: '60-120'
      },
      {
        id: 'SP2RNHHQDTHGHPEVX83291K4AQZVGWEJ7WCQQDA9R.giga-pepe-v2',
        name: 'Giga Pepe v2',
        expectedPrice: '60-120'
      },
      {
        id: 'SP2RNHHQDTHGHPEVX83291K4AQZVGWEJ7WCQQDA9R.tremp-nfts',
        name: 'Tremp',
        expectedPrice: '60-120'
      }
    ]
  },
  irmissima: {
    address: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ',
    collections: [
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-chromie',
        name: 'Cultured Welsh: Chromie',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-grant',
        name: 'Cultured Welsh: Grant',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-memories',
        name: 'Cultured Welsh: Memories',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-ribboned',
        name: 'Cultured Welsh: Ribboned',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-ringers',
        name: 'Cultured Welsh: Ringers',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-beepled',
        name: 'Cultured Welsh: Beepled',
        expectedPrice: '50-100'
      },
      {
        id: 'SPNFDGPASBB91FVB0FCRAZ0XCPSSZ4Y56M2AEWDZ.cultured-welsh-fidenza',
        name: 'Cultured Welsh: Fidenza',
        expectedPrice: '50-100'
      }
    ]
  },
  Vinzo: {
    address: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ',
    collections: [
      {
        id: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ.weird-welsh',
        name: 'Weird Welsh',
        expectedPrice: '50-200'
      },
      {
        id: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ.treasure-hunters',
        name: 'Treasure Hunters',
        expectedPrice: '100-200'
      },
      {
        id: 'SP3T1M18J3VX038KSYPP5G450WVWWG9F9G6GAZA4Q.jumping-pupperz',
        name: 'Jumping Pupperz',
        expectedPrice: '25-60'
      }
    ]
  },
  MooningShark: {
    address: 'SPKW6PSNQQ5Y8RQ17BWB0X162XW696NQX1868DNJ',
    collections: [
      {
        id: 'SP1KMAA7TPZ5AZZ4W67X74MJNFKMN576604CWNBQS.mooningsharks',
        name: 'Mooning Sharks',
        expectedPrice: '30-40'
      }
    ]
  },
  Jackbinswitch: {
    address: null,
    collections: [
      {
        id: 'SPV8C2N59MA417HYQNG6372GCV0SEQE01EV4Z1RQ.stacks-invaders-v0',
        name: 'Stacks Invaders',
        expectedPrice: '75-125'
      }
    ]
  },
  Unknown: {
    address: null,
    collections: [
      {
        id: 'SPJW1XE278YMCEYMXB8ZFGJMH8ZVAAEDP2S2PJYG.happy-welsh',
        name: 'Happy Welsh',
        expectedPrice: '150-5000'
      }
    ]
  }
};
