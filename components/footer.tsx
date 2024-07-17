
import VercelLogo from '@components/icons/icon-platform';
import styles from './footer.module.css';
import { cn } from '@lib/utils';
import { useEffect, useState } from 'react';
import { blocksApi } from '@lib/stacks-api';
import IconStacks from './icons/icon-stacks';
import Link from 'next/link';
import { BsDiscord, BsTwitter, BsBookHalf } from 'react-icons/bs';
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
    }).catch(console.error)
  }, [])

  return (
    <footer className={cn(styles.footer)}>
      <div className={cn('flex', 'items-center', 'justify-between', 'w-full', 'm-4')}>
        <div className={cn(styles['footer-block-height'])}>
          <IconStacks size={16} /><div>Block {blockHeight}</div>
        </div>

        <div className={cn('items-center', 'gap-4', 'flex')}>
          <Link href={'https://twitter.com/CharismaBTC'}><BsTwitter className='cursor-pointer fill-gray-300 hover:fill-gray-100' size={16} /></Link>
          <Link href={'https://discord.gg/UTZmwWGC8C'}><BsDiscord className='cursor-pointer fill-gray-300 hover:fill-gray-100' size={16} /></Link>
          <Link href={'https://docs.charisma.rocks'}><BsBookHalf className='cursor-pointer fill-gray-300 hover:fill-gray-100' /></Link>
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
          <p className={cn(styles['footer-paragraph'], 'px-1')}>|</p>
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
