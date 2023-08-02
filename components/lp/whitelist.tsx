import { cn } from '@lib/utils';
import styles from './whitelist.module.css';
import styleUtils from '@components/utils.module.css';
import WhitelistForm from './whitelist-form';

export default function Whitelist() {

  return (
    <div
      className={cn(styles['ticket-layout'])}
    >
      <div >
        <div className={styles['ticket-text']}>
          <h2 className={cn(styles.hero, styleUtils.appear, styleUtils['appear-first'])}>
            <>
              You're in. <br /> Want Whitelist?
            </>
          </h2>
          <p className={cn(styles.description, styleUtils.appear, styleUtils['appear-second'])}>
            <>
              Connect with your Stacks wallet to claim your spot for early access.
            </>
          </p>
        </div>
        <div className={cn(styleUtils.appear, styleUtils['appear-third'])}>
          <WhitelistForm />
        </div>
      </div>
      <div className={styles['ticket-visual-wrapper']}>

      </div>
    </div>
  );
}
