import Page from '@components/page';

export default function PrivacyPolicy() {
    const meta = {
        title: 'Signet | Privacy Policy',
        description: 'Privacy Policy for the Signet Chrome Extension',
        image: 'https://charisma.rocks/signet/icon-128.png'
    };

    return (
        <Page meta={meta} fullViewport>
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h1 className="text-3xl font-bold">Signet Chrome Extension Privacy Policy</h1>
                        <p className="mt-1 text-sm text-gray-500">Last Updated: March 13, 2025</p>
                    </div>

                    <div className="px-6 py-5 space-y-6">
                        <section>
                            <h2 className="text-xl font-semibold mb-3">Introduction</h2>
                            <p>
                                This Privacy Policy describes how Signet Chrome Extension ("we", "our", or "Signet") handles user data and privacy.
                                Signet is committed to protecting your personal information and providing a secure experience for managing blockchain interactions.
                                This policy outlines what information we collect, how we use it, and the security measures implemented to protect your data.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">Data Collection and Storage</h2>

                            <h3 className="text-lg font-medium mt-4 mb-2">What We Collect and Store Locally</h3>
                            <p>
                                Signet collects and stores the following information <strong>locally on your device only</strong>:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li><strong>Wallet Information</strong>: Public blockchain addresses and encrypted private keys</li>
                                <li><strong>Transaction History</strong>: Records of transactions you've signed or authorized</li>
                                <li><strong>Connection Preferences</strong>: List of websites you've authorized to connect to your wallet</li>
                                <li><strong>Auto-Signing Configurations</strong>: Any settings for trusted websites where you've enabled streamlined signing</li>
                            </ul>

                            <h3 className="text-lg font-medium mt-4 mb-2">What We Do NOT Collect</h3>
                            <p>
                                Signet <strong>does not</strong>:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Collect or store your private keys or seed phrases in unencrypted form</li>
                                <li>Transmit your private keys or seed phrases to any server</li>
                                <li>Track your browsing history beyond connections to authorized dApps</li>
                                <li>Collect personal identification information (name, email, phone number, etc.)</li>
                                <li>Use cookies for tracking or analytics purposes</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">Data Usage</h2>

                            <h3 className="text-lg font-medium mt-4 mb-2">How We Use Your Data</h3>
                            <p>
                                The data collected is used solely for the following purposes:
                            </p>
                            <ol className="list-decimal pl-5 mt-2 space-y-1">
                                <li><strong>Enabling Core Functionality</strong>: To allow you to securely manage your wallet, connect to dApps, and sign blockchain transactions</li>
                                <li><strong>Providing Transaction Verification</strong>: To verify transaction details before signing</li>
                                <li><strong>Facilitating Subnet Compatibility</strong>: To enable Layer 2 scaling through Blaze subnet technologies</li>
                                <li><strong>Improving User Experience</strong>: To remember your preferences and connected applications</li>
                            </ol>

                            <h3 className="text-lg font-medium mt-4 mb-2">No Third-Party Sharing</h3>
                            <p>
                                We do not sell, rent, or share any of your data with third parties. All sensitive information remains encrypted on your local device.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">Security Measures</h2>

                            <h3 className="text-lg font-medium mt-4 mb-2">How We Protect Your Data</h3>
                            <p>
                                Signet implements multiple layers of security to protect your data:
                            </p>
                            <ol className="list-decimal pl-5 mt-2 space-y-1">
                                <li><strong>Local-Only Storage</strong>: All sensitive data is stored solely on your device</li>
                                <li><strong>Encryption</strong>: Private keys and seed phrases are encrypted using industry-standard encryption</li>
                                <li><strong>Content Isolation</strong>: Extension scripts are isolated from webpage contexts</li>
                                <li><strong>Permission-Based Access</strong>: Clear permission requests before connecting to any website</li>
                                <li><strong>No Remote Servers</strong>: Signet does not maintain servers that store or process your data</li>
                            </ol>

                            <h3 className="text-lg font-medium mt-4 mb-2">User Control</h3>
                            <p>
                                You maintain complete control over your data through:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>The ability to disconnect from any connected website</li>
                                <li>Options to clear all local data</li>
                                <li>Explicit permission requirements before any website can connect to your wallet</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">Changes to Privacy Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
                                We will notify users of any material changes through the extension interface.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                            <p>
                                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>GitHub: <a href="https://github.com/charisma/signet" className="text-blue-600 hover:underline">github.com/charisma/signet</a></li>
                                <li>Discord: <a href="https://discord.gg/signet" className="text-blue-600 hover:underline">discord.gg/signet</a></li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-3">Your Consent</h2>
                            <p>
                                By using the Signet Chrome Extension, you consent to the data practices described in this Privacy Policy.
                                If you do not agree with this policy, please uninstall the extension.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </Page>
    );
}