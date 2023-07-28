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

import cn from 'classnames';
import styleUtils from './utils.module.css';
import styles from './hero.module.css';
import { BRAND_NAME, DATE, SITE_DESCRIPTION } from '@lib/constants';
import Image from 'next/image';

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
      <div className={styles.heroContainer}>
        <Image src="/charisma.png" alt="Logo" width="75" height="75" className={cn(styleUtils.appear, styleUtils['appear-sixth'])} />{' '}
        <span className={cn(styleUtils.appear, styleUtils['appear-sixth'], styles.hero)}>
          {BRAND_NAME}
        </span>
        <span className={cn(styleUtils.appear, styleUtils['appear-sixth'])}>{' '}CHA</span>
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
      <div className={cn(styleUtils.appear, styleUtils['appear-sixth'], styles.info)}>
        <p>{DATE}</p>
        <div className={styles['description-separator']} />
        <p>
          <strong>Launching</strong>
        </p>
      </div>
    </div>
  );
}
