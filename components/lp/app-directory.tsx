import AppCard from './app-card';
import { APPS } from '@lib/apps';

export default function AppDirectory() {
    return (
        <section className="py-16 container mx-auto px-4">
            {/* <h2 className="text-3xl font-bold text-center mb-10">Explore the Charisma Ecosystem</h2> */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {APPS.map((app) => (
                    <AppCard key={app.href} app={app} />
                ))}
            </div>
        </section>
    );
} 