import React, { useEffect, useState } from 'react';
import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { Button } from '@components/ui/button';
import Link from 'next/link';
import { fetchAllContractTransactions, getProposals, updateVoteData } from '@lib/stacks-api';
import dmlogo from '@public/dm-logo.png';

type Props = {
  data: any[];
};

interface LeaderboardEntry {
  num: number;
  image: string;
  address: string;
  powerScore: number;
  questsCompleted: number;
  link: string;
}

export default function Leaderboard() {
  const meta = {
    title: 'Charisma | Leaderboard',
    description: META_DESCRIPTION
  };
  const [data, setData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // API endpoint
    const apiUrl = 'https://api';

    // Fetch data from the API
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(json => setData(json))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="m-2 sm:container sm:mx-auto sm:py-10">
          <div className="flex justify-between items-end">
            <h1 className="text-xl text-left mt-8 mb-2 text-gray-200">Leaderboard</h1>
            <Link href="/governance/guide">
              <Button variant={'link'} className="my-2 px-0">
                DAO Contributer Guide 📕
              </Button>
            </Link>
          </div>
          <div className="leaderboard">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Power Score</th>
                  <th>Quests Completed</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.num}</td>
                    <td>
                      <div className="name-wrapper">
                        <img src={entry.image} alt="Avatar" />
                        <span>{entry.address}</span>
                        <button
                          onClick={() => {
                            // Handle copy address logic here
                            const textarea = document.createElement('textarea');
                            textarea.value = entry.address;
                            document.body.appendChild(textarea);
                            textarea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textarea);
                          }}
                          className="copy-icon"
                        >
                          Copy
                        </button>
                      </div>
                    </td>
                    <td>{entry.powerScore}</td>
                    <td>{entry.questsCompleted}</td>
                    <td>
                      <a href={entry.link}>
                        <i className="fas fa-external-link-alt"></i>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const proposals = await getProposals();

  const transactions = await fetchAllContractTransactions(
    'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting'
  );

  const updatedProposals = updateVoteData(proposals, transactions);

  return {
    props: {
      data: updatedProposals
    },
    revalidate: 60
  };
};
