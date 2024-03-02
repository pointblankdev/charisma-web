
import { cn } from '@lib/utils';
import styleUtils from '@components/utils.module.css';
import styles from './hero.module.css';
import { BRAND_NAME, DATE, SITE_DESCRIPTION } from '@lib/constants';
import Image from 'next/image';
import charisma from '@public/charisma.png'

export default function Hero() {
  return (
    <div className={styles.wrapper}>
      <h2
        className={cn(
          styleUtils.appear,
          styleUtils['appear-first'],
          styles.description,
          styleUtils['hide-on-mobile'],
          styleUtils['hide-on-tablet'],
        )}
      >
        {SITE_DESCRIPTION}
      </h2>
      <div className={cn(styles.heroContainer, 'space-x-1')}>
        <Image src={charisma} alt="Logo" width="75" height="75" className={cn(styleUtils.appear, styleUtils['appear-third'])} />{' '}
        <span className={cn(styleUtils.appear, styleUtils['appear-third'], styles.hero)}>
          {BRAND_NAME}
        </span>
        <span className={cn(styleUtils.appear, styleUtils['appear-third'])}>{' '}CHA</span>
      </div>
      <h2
        className={cn(
          styleUtils.appear,
          styleUtils['appear-first'],
          styles.description,
          styleUtils['show-on-mobile'],
          styleUtils['show-on-tablet'],
        )}
      >
        {SITE_DESCRIPTION}
      </h2>
      <div className={cn(styleUtils.appear, styleUtils['appear-eighth'], styles.about)}>
        <p>The largest community-run DAO on Stacks</p>
      </div>
    </div>
  );
}
