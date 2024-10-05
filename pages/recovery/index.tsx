import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function RecoveryIndex() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/recovery/plan');
    }, [router]);

    return null;
}