import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@lib/utils';
import charisma from '@public/charisma.png';

export default function Footer() {
    return (
        <footer className="bg-card/40 backdrop-blur-md border-t border-muted-foreground/10">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Image src={charisma} alt="Charisma Logo" width={24} height={24} />
                            <span className="font-semibold">Charisma</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Building the next generation of blockchain applications and infrastructure.
                        </p>
                    </div>

                    {/* Products */}
                    <div className="col-span-1">
                        <h3 className="font-medium mb-3">Products</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Simple Swap</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Token Cache</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Launchpad</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">All Products</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className="col-span-1">
                        <h3 className="font-medium mb-3">Company</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">About</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="col-span-1">
                        <h3 className="font-medium mb-3">Resources</h3>
                        <ul className="space-y-2">
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Documentation</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Help Center</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                            <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center opacity-90">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} Charisma. All rights reserved.
                    </p>

                    <div className="flex gap-4 mt-4 md:mt-0">
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Twitter</Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Discord</Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">GitHub</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
} 