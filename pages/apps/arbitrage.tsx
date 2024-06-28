import { SkipNavContent } from '@reach/skip-nav';
import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { GetStaticProps } from 'next';
import { getTokenPrices } from '@lib/stacks-api';

export default function App({ data }: Props) {
  const meta = {
    title: 'Charisma | Arbitrage',
    description: META_DESCRIPTION,
    // image: '/uppsala-21.png'
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10 md:max-w-2xl">

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Arbitrage</th>
                  <th className="px-4 py-2 border">VELAR</th>
                  <th className="px-4 py-2 border">ALEX</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border">STX</td>
                  <td className="px-4 py-2 border">{Number(data.velar.stx.price).toFixed(8)}</td>
                  <td className="px-4 py-2 border">{data.alex.stx.price}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">WELSH</td>
                  <td className="px-4 py-2 border">{Number(data.velar.welsh.price).toFixed(8)}</td>
                  <td className="px-4 py-2 border">{data.alex.welsh.price}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border">sWELSH</td>
                  <td className="px-4 py-2 border">{Number(data.velar.swelsh.price).toFixed(8)}</td>
                  <td className="px-4 py-2 border">{'-'}</td>
                </tr>
              </tbody>
            </table>
          </div>



        </div>
      </Layout>
    </Page>
  );
}

type Props = {
  data: any;
};


export const getServerSideProps = async () => {

  try {

    const alexStxResponse = await fetch('https://api.alexgo.io/v1/price/token-wstx', {
      method: 'GET',
      headers: {},
    });
    const alexWelshResponse = await fetch('https://api.alexgo.io/v1/price/token-wcorgi', {
      method: 'GET',
      headers: {},
    });

    const alexStx = await alexStxResponse.json();
    const alexWelsh = await alexWelshResponse.json();

    const message = await getTokenPrices()

    console.log(message)

    return {
      props: {
        data: {
          alex: {
            welsh: alexWelsh,
            stx: alexStx
          },
          velar: {
            stx: message[0],
            welsh: message[6],
            swelsh: message[14]
          }
        }
      },
      // revalidate: 60
    };

  } catch (error) {
    return {
      props: {
        data: {}
      },
    }
  }
};
