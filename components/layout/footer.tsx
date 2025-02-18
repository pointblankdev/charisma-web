import styles from './footer.module.css';
import { cn } from '@lib/utils';
import IconStacks from '../icons/icon-stacks';
import Link from 'next/link';
import { BsDiscord, BsTwitter, BsBookHalf, BsGithub } from 'react-icons/bs';
import { BITCOIN_LEARN_MORE_URL, STACKS_LEARN_MORE_URL } from '@lib/constants';
import { useGlobal } from '@lib/hooks/global-context';

export default function Footer() {
  const { block } = useGlobal();

  return (
    <footer className={cn(styles.footer)}>
      <div className={cn('flex', 'items-center', 'justify-center', 'w-full', 'm-4')}>

        <div className={cn('items-center', 'gap-4', 'flex')}>
          <Link href={'https://twitter.com/CharismaBTC'}>
            <BsTwitter className="cursor-pointer fill-gray-300 hover:fill-gray-100" size={16} />
          </Link>
          <Link href={'https://discord.gg/UTZmwWGC8C'}>
            <BsDiscord className="cursor-pointer fill-gray-300 hover:fill-gray-100" size={16} />
          </Link>
          <Link href={'https://github.com/pointblankdev/charisma-web'}>
            <BsGithub className="cursor-pointer fill-gray-300 hover:fill-gray-100" size={16} />
          </Link>
          <Link href={'https://docs.charisma.rocks'}>
            <BsBookHalf className="cursor-pointer fill-gray-300 hover:fill-gray-100" size={16} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
