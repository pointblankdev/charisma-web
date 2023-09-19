import Page from '@components/page';
import { META_DESCRIPTION } from '@lib/constants';
import Layout from '@components/layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Button } from '@components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@lib/utils';
import React, { useEffect } from 'react';
import charismaToken from '@public/charisma.png'
import { GetStaticProps } from 'next';
import { getQuestById } from '@lib/db-providers/dato';


type Props = any

export default function QuestDetail(quest: Props) {
    const meta = {
        title: 'Charisma | Quest-to-Earn',
        description: META_DESCRIPTION
    };

    console.log(quest)

    return (
        <Page meta={meta} fullViewport>
            <Layout className='m-2 sm:container sm:mx-auto sm:py-10 items-center'>
                asd
            </Layout>
        </Page >
    );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {

    const quest = await getQuestById(params?.id as string)


    return {
        props: {
            ...quest
        },
        revalidate: 60
    };
};

export const getStaticPaths = () => {
    return {
        paths: [
            { params: { id: '176696311' } },
        ],
        fallback: true
    };
}