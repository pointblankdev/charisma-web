
const API_URL = 'https://graphql.datocms.com/';
const API_TOKEN = process.env.DATOCMS_READ_ONLY_API_TOKEN;

async function fetchCmsAPI(query: string, { variables }: { variables?: Record<string, any> } = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_TOKEN}`
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  const json = await res.json();
  if (json.errors) {
    // eslint-disable-next-line no-console
    console.error(json.errors);
    throw new Error('Failed to fetch API');
  }

  return json.data;
}

export async function getAllWallets(): Promise<any[]> {
  const data = await fetchCmsAPI(`
      {
        allWallets(first: 100, filter: {stxaddress: {isPresent: true}}) {
          id
          stxaddress
          charisma
          bns
        }
      }
    `);
  return data.allWallets;
}

export async function getAllQuests(): Promise<any[]> {
  const data = await fetchCmsAPI(`
      {
        allQuests(first: 100, orderBy: id_ASC) {
          id
          slug
          title
          subtitle
          questid
          images {
            url(imgixParams: {fm: jpg, fit: crop, w: 600, h: 1200})
            blurDataURL: blurUpThumb
          }
          guild {
            logo {
              url(imgixParams: {fm: jpg, fit: crop, w: 400, h: 400})
              blurDataURL: blurUpThumb
            }
          }
          description
          objectives
          contractIdentifier
          method
        }
      }
    `);
  return data.allQuests;
}

export async function getQuestBySlug(slug: string): Promise<any> {
  const data = await fetchCmsAPI(`
      query QuestBySlug($slug: String) {
        quest(filter: {slug: {eq: $slug}}) {
          id
          slug
          title
          subtitle
          questid
          images {
            url(imgixParams: {fm: jpg, fit: crop, w: 600, h: 1200})
            blurDataURL: blurUpThumb
          }
          guild {
            logo {
              url(imgixParams: {fm: jpg, fit: crop, w: 400, h: 400})
              blurDataURL: blurUpThumb
            }
          }
          description
          objectives
        }
      }
    `, {
    variables: {
      slug
    }
  });
  return data.quest;
}

export async function getQuestById(id: string | number): Promise<any> {
  const data = await fetchCmsAPI(`
      query QuestById($id: ItemId) {
        allQuests(filter: {id: {eq: $id}}) {
          id
          slug
          title
          subtitle
          questid
          images {
            url(imgixParams: {fm: jpg, fit: crop, w: 600, h: 1200})
            blurDataURL: blurUpThumb
          }
          guild {
            logo {
              url(imgixParams: {fm: jpg, fit: crop, w: 400, h: 400})
              blurDataURL: blurUpThumb
            }
          }
          description
          objectives
        }
      }
    `, {
    variables: {
      id
    }
  });
  return data.quest;
}


export async function getAllGuilds(): Promise<any[]> {
  const data = await fetchCmsAPI(`
      {
        allGuilds(first: 100, orderBy: id_ASC) {
          id
          name
          description
          url
          logo {
            url(imgixParams: {fm: jpg, fit: crop, w: 400, h: 400})
            blurDataURL: blurUpThumb
          }
        }
      }
    `);
  return data.allGuilds;
}

export async function getQuestImageUrls(id: string | number): Promise<any> {
  const data = await fetchCmsAPI(`
      query QuestById($id: ItemId) {
        allQuests(filter: {id: {eq: $id}}) {
          cardImage {
            url
          }
          questBgImage {
            url
          }
        }
      }
    `, {
    variables: {
      id
    }
  });
  return data.allQuests[0];
}

export async function getAllNetworks(): Promise<any[]> {
  const data = await fetchCmsAPI(`
      {
        allNetworks(first: 100) {
          id
          name
          icon {
            url(imgixParams: {fm: jpg, fit: crop, w: 400, h: 400})
            blurDataURL: blurUpThumb
          }
        }
      }
    `);
  return data.allNetworks;
}

export async function getAllSessions(): Promise<any[]> {
  const data = await fetchCmsAPI(`
      {
        allSessions(first: 100) {
          complete
          locked
          quest {
            id
          }
          wallet {
            stxaddress
          }
        }
      }
    `);
  return data.allSessions;
}
