
import { cn } from '@lib/utils';
import styleUtils from '@components/utils.module.css';
import styles from './contact.module.css';

export default function LearnMore() {
  return (
    <div className={cn(styleUtils.appear, styleUtils['appear-eighth'], styles.contact)}>
      Charisma tokens are the governance token for the Dungeon Master DAO. <br />
      They are used to vote on proposals and participate in the DAO. <br />
      Charisma tokens can be claimed from the facuet for free.
    </div>
  );
}
