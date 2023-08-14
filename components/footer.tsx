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

import VercelLogo from '@components/icons/icon-platform';
import styles from './footer.module.css';
import { cn } from '@lib/utils';
import { useEffect, useState } from 'react';
import { blocksApi } from '@lib/stacks-api';
import IconStacks from './icons/icon-stacks';
import Link from 'next/link';
import { BsDiscord, BsTwitter } from 'react-icons/bs';
import { BITCOIN_LEARN_MORE_URL, STACKS_LEARN_MORE_URL } from '@lib/constants';

export function HostedByVercel() {
  return (
    <a
      href="https://vercel.com"
      className={cn(styles['footer-link'], styles['footer-logo'])}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles['secondary-text']}>Created with </div>
      <VercelLogo color="white" />
    </a>
  );
}

export default function Footer() {

  const [blockHeight, setBlockHeight] = useState<number>(0);

  useEffect(() => {
    blocksApi.getBlockList({ limit: 1 }).then((res) => {
      const latestBlock = res.results[0]
      setBlockHeight(latestBlock.height);
    })
  }, [])

  return (
    <footer className={cn(styles.footer)}>
      <div className={cn('flex', 'items-center', 'justify-between', 'w-full', 'm-4')}>
        <div className={cn(styles['footer-block-height'])}>
          <IconStacks size={16} /><div>Block {blockHeight}</div>
        </div>

        <div className={cn('items-center', 'gap-4', 'flex')}>
          <Link href={'https://twitter.com/CharismaBTC'}><BsTwitter className='cursor-pointer fill-gray-300 hover:fill-gray-100 sm:hidden' size={16} /></Link>
          <Link href={'https://discord.gg/UTZmwWGC8C'}><BsDiscord className='cursor-pointer fill-gray-300 hover:fill-gray-100 sm:hidden' size={16} /></Link>
        </div>
        <div className={cn('hidden', 'sm:flex')}>
          <p className={styles['footer-paragraph']}>
            <a
              href={STACKS_LEARN_MORE_URL}
              className={styles['footer-link']}
              target="_blank"
              rel="noopener noreferrer"
            >
              Powered by Stacks
            </a>
          </p>
          <div className={styles['footer-separator']} />
          <p className={styles['footer-paragraph']}>
            <a
              href={BITCOIN_LEARN_MORE_URL}
              className={styles['footer-link']}
              target="_blank"
              rel="noopener noreferrer"
            >
              Secured by Bitcoin
            </a>
          </p>
        </div>
      </div>
    </footer >
  );
}
