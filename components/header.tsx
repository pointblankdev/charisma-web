import { ReactNode } from 'react';
import styles from './header.module.css';

type Props = {
  hero: ReactNode;
  description: ReactNode;
};

export default function Header({ hero, description }: Props) {
  return (
    <>
      <h1 className={styles.hero}>{hero}</h1>
      <p className={styles.description}>{description}</p>
    </>
  );
}
