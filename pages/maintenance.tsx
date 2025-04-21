import Head from 'next/head';
import { Button } from '@components/ui/button';

export default function Maintenance() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center px-4">
            <Head>
                <title>Under Maintenance</title>
            </Head>
            <img src="/sip9/pills/cha-floating.gif" alt="Charisma Token" className="w-48 h-48 mb-6" />
            <h1 className="text-4xl font-bold mb-4 text-white">We'll be back soon!</h1>
            <p className="text-lg text-gray-400 max-w-xl mb-4">
                Our site is currently undergoing a major rework and re‑architecture. We're rebuilding core
                systems, improving performance, and polishing the user experience so Charisma can be even
                better than before.
            </p>
            <p className="text-sm text-gray-500 max-w-xl mb-8">
                During this time the app will be unavailable. APIs will continue to operate normally. Thank you
                for your patience and support while we work behind the scenes!
            </p>
        </div>
    );
} 