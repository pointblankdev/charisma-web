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
import styleUtils from './utils.module.css';
import { CODE_OF_CONDUCT, LEGAL_URL, REPO } from '@lib/constants';
import { cn } from '@lib/utils';
import { useEffect, useState } from 'react';
import { blocksApi } from '@lib/stacks-api';
import IconStacks from './icons/icon-stacks';

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
      <div className={styles['footer-legal']}>
        <div className={cn(styles['footer-copyright'], styleUtils['hide-on-mobile'])}>
          <IconStacks size={16} /> <span>Block {blockHeight}</span>
        </div>
        <div className={styles['footer-center-group']}>
          <p className={styles['footer-paragraph']}>
            <a
              href={REPO}
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
              href={CODE_OF_CONDUCT}
              className={styles['footer-link']}
              target="_blank"
              rel="noopener noreferrer"
            >
              Secured by Bitcoin
            </a>
          </p>
          {LEGAL_URL && (
            <>
              <div className={styles['footer-separator']} />
              <p className={styles['footer-paragraph']}>
                <a
                  href={LEGAL_URL}
                  className={styles['footer-link']}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Legal
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
