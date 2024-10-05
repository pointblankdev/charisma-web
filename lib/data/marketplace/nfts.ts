export interface NFT {
  name: string
  artist: string
  cover: string
  type: "image" | "gif" | "video" | "audio"
  price: number
}

export const featuredNFTs: NFT[] = [
  {
    name: "Memobot #21",
    artist: "Evil Twin",
    cover: "https://charisma.rocks/sip9/memobots/21.gif",
    type: "image",
    price: 0.5
  },
  {
    name: "Memobot #145",
    artist: "I Got My Swagger Back",
    cover: "https://charisma.rocks/sip9/memobots/145.gif",
    type: "gif",
    price: 0.8
  },
  {
    name: "Memobot #213",
    artist: "Back to the Gigaverse",
    cover: "https://charisma.rocks/sip9/memobots/213.GIF",
    type: "video",
    price: 1.2
  },
  // {
  //   name: "Memobot #21",
  //   artist: "Evil Genius",
  //   cover: "https://charisma.rocks/sip9/memobots/21.gif",
  //   type: "audio",
  //   price: 0.3
  // },
]

export const recentlyAddedNFTs: NFT[] = [
  {
    name: "Quantum Quill",
    artist: "Data Painter",
    cover: "https://charisma.rocks/sip9/pills/blue-pill.gif",
    type: "image",
    price: 0.4
  },
  {
    name: "Cyber Serenity",
    artist: "Virtual Visionary",
    cover: "https://charisma.rocks/sip9/pills/blue-pill.gif",
    type: "gif",
    price: 0.6
  },
  {
    name: "Holographic Horizons",
    artist: "3D Dreamer",
    cover: "https://charisma.rocks/sip9/pills/blue-pill.gif",
    type: "video",
    price: 0.9
  },
  {
    name: "Binary Beats",
    artist: "Code Composer",
    cover: "https://charisma.rocks/sip9/pills/blue-pill.gif",
    type: "audio",
    price: 0.2
  },
  {
    name: "Fractal Fantasy",
    artist: "Math Magician",
    cover: "https://charisma.rocks/sip9/pills/blue-pill.gif",
    type: "image",
    price: 0.7
  },
  {
    name: "Augmented Aurora",
    artist: "Reality Bender",
    cover: "https://charisma.rocks/sip9/pills/blue-pill.gif",
    type: "gif",
    price: 1.0
  },
]