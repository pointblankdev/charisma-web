
import { cn } from '@lib/utils';
import styleUtils from '@components/utils.module.css';
import styles from './contact.module.css';

export default function LearnMore() {
  return (
    <div className={cn(styleUtils.appear, styleUtils['appear-eighth'], styles.contact)}>
      A Bitcoin Startup Lab pre-accelerator project
    </div>
  );
}
