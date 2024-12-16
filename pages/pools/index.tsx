// pages/pools/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PoolsIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/pools/new-dex');
  }, [router]);

  return null;
}
