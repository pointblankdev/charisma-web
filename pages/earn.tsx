/**
 * Copyright 2020 Vercel Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { GetStaticProps } from 'next';
import { SkipNavContent } from '@reach/skip-nav';

import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { DataTable } from '@components/quest-table/data-table';
import { columns } from '@components/quest-table/columns';

type Props = {
  data: any[];
};

export default function Earn({ data }: Props) {
  const meta = {
    title: 'Charisma | Quest to Earn',
    description: META_DESCRIPTION
  };

  return (
    <Page meta={meta} fullViewport>
      <SkipNavContent />
      <Layout>
        <div className="container mx-auto py-10">
          <DataTable columns={columns} data={data} />
        </div>
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = () => {
  const data = [
    {
      id: "001",
      amount: 1,
      name: "Charisma Faucet",
      description: "Use the Faucet to earn 1 Charisma token",
    }
  ]

  return {
    props: {
      data
    },
    revalidate: 60
  };
};
