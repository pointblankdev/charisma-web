import { useState, useEffect } from 'react';
import Layout from '@components/layout/layout';
import { useGlobal } from '@lib/hooks/global-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Label } from '@components/ui/label';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import {
  LogOut, WalletIcon, ShieldAlert, SlidersHorizontal, Puzzle, Zap, Bitcoin,
  InfoIcon, Code2, Clock, RefreshCw, AlertCircle, Gauge, Terminal, ChevronDown, Plus as PlusIcon, Minus as MinusIcon,
  Flame
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Separator } from '@components/ui/separator';
import { connect, isConnected, disconnect } from '@stacks/connect';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { useUser, useClerk } from '@clerk/nextjs';
import { cn } from '@lib/utils';
import { Dexterity } from 'dexterity-sdk';
import { useToast } from '@components/ui/use-toast';
import { usePersistedState } from '@lib/hooks/use-persisted-state';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@components/ui/select';
import {
  HoverCard, HoverCardContent, HoverCardTrigger
} from '@components/ui/hover-card';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger
} from '@components/ui/collapsible';
import { Switch } from '@components/ui/switch';
import { Input } from '@components/ui/input';

export default function SettingsPage() {
  const {
    stxAddress,
    maxHops,
    setMaxHops,
    slippage,
    setSlippage,
    setStxAddress,
    dexteritySignerSource,
    setDexteritySignerSource,
    dexterityConfig,
    refreshDexterityConfig,
    configureDexterity
  } = useGlobal();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const clerk = useClerk();

  // Get tab from URL query parameter or default to 'account'
  const tab = router.query.tab as string;
  const [activeTab, setActiveTab] = useState('account');
  const [isBlazeSignerInstalled, setIsBlazeSignerInstalled] = useState(false);
  const [blazeSignerStatus, setBlazeSignerStatus] = useState<any>(null);

  // Update the active tab when the URL query parameter changes
  useEffect(() => {
    if (tab && ['account', 'advanced', 'security'].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab('account');
    }
  }, [tab]);

  // Check if Signet Signer is installed - client-side only
  useEffect(() => {
    // Skip on server render to avoid hydration mismatch
    if (typeof window === 'undefined') return;

    const checkBlazeSigner = async () => {
      try {
        const { checkExtensionInstalled, getSignetStatus } = await import('signet-sdk');

        // Check if extension is installed
        const extensionStatus = await checkExtensionInstalled();
        setIsBlazeSignerInstalled(extensionStatus.installed);

        if (extensionStatus.installed) {
          // Get the current status which includes subnet information
          const status = await getSignetStatus();
          setBlazeSignerStatus(status);

          // We have the subnet status now instead of a simple "connected" flag
          console.log('Signet status:', status);
        }
      } catch (error) {
        console.error('Failed to check Signet installation:', error);
        setIsBlazeSignerInstalled(false);
        setBlazeSignerStatus(null);
      }
    };

    // Add a small delay to ensure other client-side code has run first
    const timer = setTimeout(() => {
      checkBlazeSigner();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Determine if Blaze has any active subnets
  const hasBlazeSubnets = blazeSignerStatus && Object.keys(blazeSignerStatus).length > 0;

  // Check if any subnet has a signer (meaning user has unlocked their wallet)
  const hasBlazeUnlocked = hasBlazeSubnets &&
    Object.values(blazeSignerStatus).some((subnet: any) => subnet.signer && subnet.signer.length > 0);

  // Extension state tracking
  const blazeState = isBlazeSignerInstalled
    ? (hasBlazeSubnets
      ? (hasBlazeUnlocked ? 'unlocked' : 'locked')
      : 'no-subnets')
    : 'not-installed';

  // Track if standard wallet is connected - with client-side detection
  const [standardWalletConnected, setStandardWalletConnected] = useState(false);

  // Check wallet connection status on client-side only
  useEffect(() => {
    setStandardWalletConnected(isConnected());
  }, []);

  // Handle standard SIP30 wallet connection
  const handleStandardWalletConnection = async () => {
    if (standardWalletConnected) {
      disconnect();
      // Update state when disconnected
      setStxAddress('');
      setStandardWalletConnected(false);

      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected successfully.",
        variant: "default"
      });
    } else {
      try {
        const response = await connect();
        console.log('Wallet connection response:', response);
        if (response && response.addresses && response.addresses.length > 0) {
          const userStxAddress = response.addresses[2].address;
          setStxAddress(userStxAddress);
          setStandardWalletConnected(true);

          // Update Dexterity configuration with the user's address
          await Dexterity.configure({
            stxAddress: userStxAddress,
            mode: 'client',
            proxy: `${window.location.origin}/api/v0/proxy`,
          });

          toast({
            title: "Wallet Connected",
            description: "Your wallet has been connected successfully.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        toast({
          title: "Connection Failed",
          description: "There was a problem connecting your wallet. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  // Handle Blaze check status
  const handleBlazeStatusCheck = async () => {
    try {
      const { getSignetStatus } = await import('signet-sdk');

      // Get the current status which includes subnet information
      const status = await getSignetStatus();
      setBlazeSignerStatus(status);

      const subnetCount = Object.keys(status).length;
      if (subnetCount > 0) {
        toast({
          title: "Signet Status",
          description: `Connected to ${subnetCount} subnet${subnetCount !== 1 ? 's' : ''}`,
          variant: "default"
        });
      } else {
        toast({
          title: "Signet Status",
          description: "No active subnets found. Extension may need setup.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Failed to check Signet status:', error);
      toast({
        title: "Status Check Failed",
        description: "There was a problem checking Signet status.",
        variant: "destructive"
      });
    }
  };

  // Format wallet address for display
  const shortAddress = stxAddress ? `${stxAddress.slice(0, 6)}...${stxAddress.slice(-4)}` : 'Not connected';

  // Create client-safe references in the component
  const [clientSideRendered, setClientSideRendered] = useState(false);

  useEffect(() => {
    setClientSideRendered(true);
  }, []);

  const walletConnected = clientSideRendered ? standardWalletConnected : false;
  const handleWalletConnection = handleStandardWalletConnection;

  // Advanced and Performance settings
  // These are disabled as they're not confirmed to be supported by the SDK
  const [cacheTime, setCacheTime] = usePersistedState('dexterity-cache-time', 30000);
  const [dataPrefetch, setDataPrefetch] = usePersistedState('data-prefetch', true);

  // Developer settings
  // These are disabled as they're not confirmed to be supported by the SDK
  const [transactionMode, setTransactionMode] = usePersistedState('tx-mode', 'standard');
  const [debugMode, setDebugMode] = usePersistedState('debug-mode', false);
  const [apiOverride, setApiOverride] = usePersistedState('api-override', '');

  // Flag to indicate if SDK features are confirmed to be supported
  const PERFORMANCE_FEATURES_SUPPORTED = false;
  const DEVELOPER_FEATURES_SUPPORTED = false;

  // Get active signer source based on connections and preferences
  const getActiveSigner = () => {
    if (dexteritySignerSource === 'blaze' && blazeState === 'unlocked') {
      return 'Signet';
    } else if (dexteritySignerSource === 'sip30' && walletConnected) {
      return 'SIP30 Wallet';
    } else {
      return null;
    }
  };

  const activeSigner = getActiveSigner();

  // Helper function to get signer status message
  const getSignerStatusMessage = () => {
    if (activeSigner) {
      return `Dexterity is using ${activeSigner} for signing transactions. ${dexteritySignerSource === 'blaze'
        ? 'This enables subnet capabilities including off-chain transactions.'
        : 'This enables standard blockchain interactions.'
        }`;
    } else if (!walletConnected && blazeState !== 'unlocked') {
      return 'Connect a SIP30 wallet or unlock Signet to enable signing capabilities.';
    } else if (walletConnected && blazeState === 'unlocked') {
      return 'Both signing methods are available. Select your preferred option.';
    } else if (walletConnected) {
      return 'Only SIP30 wallet is available for signing. Install Signet for enhanced features.';
    } else {
      return 'Only Signet is available for signing. Connect a SIP30 wallet for standard transactions.';
    }
  };

  // Helper to get routing depth description
  const getRoutingDepthDescription = () => {
    if (maxHops === 1) return 'Direct exchanges only (fastest, may not find best rate)';
    if (maxHops === 2) return 'Single intermediate token (good balance)';
    if (maxHops === 3) return 'Up to two intermediate tokens (recommended)';
    if (maxHops >= 4) return `${maxHops} total hops (may be slower but finds optimal rates)`;
    return '';
  };

  // Helper to get transaction mode description
  const getTransactionModeDescription = () => {
    switch (transactionMode) {
      case 'sponsored':
        return 'Transactions will be submitted without fees (requires server support)';
      case 'optimistic':
        return 'UI updates immediately before blockchain confirmation';
      default:
        return 'Standard blockchain transactions with normal confirmation flow';
    }
  };

  // Function to refresh Dexterity configuration display with toast
  const handleRefreshConfig = () => {
    const success = refreshDexterityConfig();

    if (success) {
      toast({
        title: "Configuration Refreshed",
        description: "Dexterity configuration has been refreshed.",
        variant: "default"
      });
    } else {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh Dexterity configuration.",
        variant: "destructive"
      });
    }
  };

  // Reset all developer settings
  const resetAllDeveloperSettings = () => {
    setTransactionMode('standard');
    setDebugMode(false);
    setApiOverride('');

    toast({
      title: "Developer Settings Reset",
      description: "All developer settings have been reset to default values.",
      variant: "default"
    });
  };

  // Update Dexterity when signer source changes
  useEffect(() => {
    // Skip during server-side rendering
    if (!clientSideRendered) return;

    const updateDexterityConfig = async () => {
      let signerAddress;

      if (dexteritySignerSource === 'blaze' && blazeState === 'unlocked') {
        signerAddress = (Object.values(blazeSignerStatus).find((subnet: any) => subnet.signer) as any)?.signer;
      } else if (dexteritySignerSource === 'sip30' && walletConnected) {
        signerAddress = stxAddress;
      }

      if (signerAddress) {
        await configureDexterity(signerAddress);
      }
    };

    updateDexterityConfig();
  }, [dexteritySignerSource, blazeState, walletConnected, stxAddress, blazeSignerStatus, configureDexterity, clientSideRendered]);

  return (
    <Layout>
      <div className="container max-w-7xl py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value);
            // Update URL without a full page reload
            router.push(`/settings?tab=${value}`, undefined, { shallow: true });
          }}
          className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                      <AvatarFallback>{user?.firstName?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user?.fullName || "User"}</h3>
                      <p className="text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WalletIcon className="size-5" />
                    Blockchain Connectivity
                  </CardTitle>
                  <CardDescription>
                    Connect your wallet to access blockchain functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="relative border rounded-lg p-5">
                      <div className="absolute -top-4 left-4 px-2">
                        <span className="text-sm font-medium">Available Connection Methods</span>
                      </div>

                      {/* Signet - Primary/Recommended */}
                      <div className="p-4 bg-cyan-800/10 rounded-lg border-2 border-cyan-900/20 relative mb-4">
                        <div className="absolute -top-2.5 right-20 bg-cyan-500/40 rounded-full px-2 py-0 text-xs text-white font-medium">
                          Recommended
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="size-6 flex items-center justify-center rounded-md bg-cyan-500 text-white">
                              <Zap className="size-4" />
                            </div>
                            <span className="font-medium">Signet Signer</span>
                          </div>
                          <Badge variant="outline" className={
                            blazeState === 'unlocked' ? "bg-green-500/10 text-green-500" :
                              blazeState === 'locked' ? "bg-yellow-500/10 text-yellow-500" :
                                "bg-muted"}>
                            {blazeState === 'unlocked' ? "Active" :
                              blazeState === 'locked' ? "Locked" :
                                blazeState === 'no-subnets' ? "Setup Needed" : "Not Installed"}
                          </Badge>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">Enhanced Capabilities</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Next-generation signer with advanced features including subnet integration,
                              off-chain transactions, and streamlined contract deployment.
                            </p>
                          </div>

                          <div className="flex gap-2">
                            {!isBlazeSignerInstalled && (
                              <a
                                href="https://gist.github.com/r0zar/414e91d3e6769644981b4918141a1708#file-blaze_protocol-md"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90"
                              >
                                Install
                              </a>
                            )}

                            <Button variant="outline" size="sm" onClick={handleBlazeStatusCheck}
                              disabled={!isBlazeSignerInstalled}
                              className='bg-cyan-500/10'>
                              {blazeState === 'locked' ? "Check Status" : "Refresh Status"}
                            </Button>
                          </div>
                        </div>

                        {/* Status details when installed but not unlocked */}
                        {isBlazeSignerInstalled && blazeState !== 'unlocked' && (
                          <div className={`p-3 rounded-lg ${blazeState === 'locked' ? "bg-yellow-500/10" :
                            blazeState === 'no-subnets' ? "bg-blue-500/10" : "bg-muted/50"
                            }`}>
                            <div className="text-sm font-medium mb-1.5">
                              {blazeState === 'locked' ? (
                                <span className="text-yellow-500">Signer Locked</span>
                              ) : (
                                <span className="text-blue-500">Setup Needed</span>
                              )}
                            </div>

                            <p className="text-xs text-muted-foreground">
                              {blazeState === 'locked' ? (
                                "Your Signet Signer is locked. To use enhanced features, click the Signet icon in your browser toolbar and enter your password."
                              ) : (
                                "Your Signet Signer is installed but doesn't have any active subnets. Subnets will be automatically created when you use compatible services."
                              )}
                            </p>
                          </div>
                        )}

                        {/* Capability list - visible even when not installed */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mt-3">
                          <div className="flex items-center gap-1.5">
                            <div className={`size-2 rounded-full ${blazeState === 'unlocked' ? "bg-green-500" : "bg-gray-300"}`}></div>
                            <span className="text-muted-foreground">STX Transactions</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`size-2 rounded-full ${blazeState === 'unlocked' ? "bg-green-500" : "bg-gray-300"}`}></div>
                            <span className="text-muted-foreground">Contract Deployment</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`size-2 rounded-full ${blazeState === 'unlocked' ? "bg-green-500" : "bg-gray-300"}`}></div>
                            <span className="text-muted-foreground">Subnet Integration</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-full bg-gray-300"></div>
                            <span className="text-muted-foreground">Bitcoin Operations (Coming Soon)</span>
                          </div>
                        </div>

                        {/* Unlocked Details - Only show when fully active */}
                        {clientSideRendered && blazeState === 'unlocked' && (
                          <div className="mt-4 border-t border-muted pt-4 space-y-4">
                            {/* Addresses */}
                            {Object.values(blazeSignerStatus).some((subnet: any) => subnet.signer) && (
                              <div>
                                <div className="text-sm font-medium mb-2">Addresses</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {/* Stacks STX Address */}
                                  <div className="p-3 bg-muted/50 rounded-md">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="size-6 overflow-hidden rounded-md">
                                          <Image
                                            src="/stx-logo.png"
                                            alt="Stacks Logo"
                                            width={24}
                                            height={24}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <span className="font-medium text-sm">Stacks (STX)</span>
                                      </div>
                                      <Badge variant="secondary" className="font-mono text-xs">Standard</Badge>
                                    </div>
                                    <div className="mt-2 font-mono text-xs bg-cyan-500/5 p-2 rounded break-all">
                                      {(Object.values(blazeSignerStatus).find((subnet: any) => subnet.signer) as any)?.signer}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Used for standard Stacks blockchain operations</p>
                                  </div>

                                  {/* Signet STX Address */}
                                  <div className="p-3 bg-muted/50 rounded-md">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="bg-primary text-white p-1 rounded-md">
                                          <Flame className="size-4" />
                                        </div>
                                        <span className="font-medium text-sm">Blaze Protocol (STX)</span>
                                      </div>
                                      <Badge variant="secondary" className="font-mono text-xs">Subnet</Badge>
                                    </div>
                                    <div className="mt-2 font-mono text-xs bg-cyan-500/5 p-2 rounded break-all">
                                      {(Object.values(blazeSignerStatus).find((subnet: any) => subnet.signer) as any)?.signer}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">Used for subnet-based off-chain transactions with enhanced speed and privacy</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Connected Subnets */}
                            {Object.keys(blazeSignerStatus).length > 0 && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium">Connected Subnets</span>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {Object.keys(blazeSignerStatus).length} Active
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {Object.keys(blazeSignerStatus).map((subnetId) => {
                                    const subnet = blazeSignerStatus[subnetId];
                                    return (
                                      <div key={subnetId} className="flex items-center justify-between px-3 py-2 rounded bg-cyan-500/5">
                                        <div className="flex items-center gap-2">
                                          <div className="size-2 rounded-full bg-green-500"></div>
                                          <span className="text-xs break-all">{subnetId}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Capabilities */}
                            <div className="mt-4">
                              <div className="text-sm font-medium mb-2">Enabled Capabilities</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5 text-green-500">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M13.5 3.5L5.5 11.5 2.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="font-medium">Instant Transactions</span>
                                    <p className="text-xs text-muted-foreground">Execute off-chain transactions with immediate confirmation</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5 text-green-500">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M13.5 3.5L5.5 11.5 2.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="font-medium">Privacy Features</span>
                                    <p className="text-xs text-muted-foreground">Enhanced privacy for sensitive transactions</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5 text-green-500">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M13.5 3.5L5.5 11.5 2.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="font-medium">Subnet Connectivity</span>
                                    <p className="text-xs text-muted-foreground">Access to specialized subnet networks</p>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="mt-0.5 text-green-500">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M13.5 3.5L5.5 11.5 2.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  </div>
                                  <div>
                                    <span className="font-medium">Gas-Free Transactions</span>
                                    <p className="text-xs text-muted-foreground">Execute transactions without paying gas fees</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Conditional state renders */}
                        {clientSideRendered && isBlazeSignerInstalled && blazeState === 'no-subnets' && (
                          <div className="rounded-lg border bg-card p-4 mt-2">
                            <div className="text-sm font-medium text-blue-500">No Active Subnets</div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Your Signet Signer is installed but doesn't have any active subnets.
                              Subnets will be automatically created when you use compatible services.
                            </p>
                          </div>
                        )}

                        {clientSideRendered && isBlazeSignerInstalled && blazeState === 'locked' && (
                          <div className="rounded-lg border bg-yellow-500/10 p-4 mt-2">
                            <div className="text-sm font-medium text-yellow-500">Signer Locked</div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Your Signet Signer is locked. To use the enhanced features, you need to:
                            </p>
                            <ol className="mt-2 text-sm text-muted-foreground list-decimal ml-4 space-y-1">
                              <li>Click the Signet icon in your browser toolbar</li>
                              <li>Enter your password to unlock your account</li>
                              <li>Return here and click "Check Status"</li>
                            </ol>
                          </div>
                        )}

                        {!isBlazeSignerInstalled && (
                          <div className="rounded-lg border bg-yellow-500/10 p-4 mt-2">
                            <div className="text-sm font-medium text-yellow-500">Signet Signer Not Installed</div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              The Signet Signer enables instant, off-chain transactions, privacy features, subnet connectivity, and gas-free transactions.
                            </p>
                            <div className="mt-3">
                              <a
                                href="https://signet-omega.vercel.app/download.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md hover:bg-primary/90"
                              >
                                Install Signet Signer
                              </a>
                            </div>
                          </div>
                        )}

                        {clientSideRendered && isBlazeSignerInstalled && (
                          <div className="text-sm mt-4">
                            <a
                              href="https://gist.github.com/r0zar/414e91d3e6769644981b4918141a1708#file-blaze_protocol-md"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline flex items-center gap-1"
                            >
                              <Puzzle className="size-3" /> Learn more about Signet
                            </a>
                          </div>
                        )}
                      </div>

                      {/* SIP30 Wallet - Traditional */}
                      <div className="p-4 bg-muted/20 rounded-lg border border-muted mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="size-6 overflow-hidden rounded-md">
                              <Image src="/stx-logo.png" alt="Stacks Logo" width={24} height={24} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-medium">SIP30 Wallet</span>
                          </div>
                          <Badge variant={walletConnected ? "outline" : "secondary"}
                            className={walletConnected ? "bg-green-500/10 text-green-500" : ""}>
                            {walletConnected ? "Connected" : "Disconnected"}
                          </Badge>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">Standard Capabilities</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              Traditional blockchain wallet for Stacks and Bitcoin transactions.
                              {!isBlazeSignerInstalled && " Currently required for all operations."}
                              {isBlazeSignerInstalled && blazeState !== 'unlocked' && " Useful while setting up Signet."}
                              {blazeState === 'unlocked' && " Recommended for Bitcoin operations."}
                            </p>
                          </div>

                          <Button
                            variant={walletConnected ? "outline" : "default"}
                            size="sm"
                            onClick={handleWalletConnection}
                            className={walletConnected ? "gap-1" : ""}
                          >
                            {walletConnected ? (
                              <>
                                <LogOut className="size-4" /> Disconnect
                              </>
                            ) : "Connect"}
                          </Button>
                        </div>

                        {/* Connected wallet details */}
                        {walletConnected && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <div className="text-sm font-medium mb-2">Your Addresses</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3 bg-muted/50 rounded-md">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="size-6 flex items-center justify-center rounded-md bg-[#F7931A] text-white">
                                        <Bitcoin className="size-4" />
                                      </div>
                                      <span className="font-medium text-sm">Bitcoin (P2WPKH)</span>
                                    </div>
                                    <Badge variant="secondary" className="font-mono text-xs">Segwit</Badge>
                                  </div>
                                  <div className="mt-2 font-mono text-xs bg-background/80 p-2 rounded break-all">
                                    bc1q7pl804yp45zyl06r5s3yu93aq9e6n8aqdleeyr
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">Used for Segwit Bitcoin transactions with lower fees</p>
                                </div>

                                <div className="p-3 bg-muted/50 rounded-md">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="size-6 flex items-center justify-center rounded-md bg-[#F7931A] text-white">
                                        <Bitcoin className="size-4" />
                                      </div>
                                      <span className="font-medium text-sm">Bitcoin (P2TR)</span>
                                    </div>
                                    <Badge variant="secondary" className="font-mono text-xs">Taproot</Badge>
                                  </div>
                                  <div className="mt-2 font-mono text-xs bg-background/80 p-2 rounded break-all">
                                    bc1p2mn2nu2t7rfay4px0pl006up6lgvnharmx86pjq72gdltrwpzj8s4d62yv
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">Used for Taproot Bitcoin transactions with enhanced privacy</p>
                                </div>

                                <div className="p-3 bg-muted/50 rounded-md">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="size-6 overflow-hidden rounded-md">
                                        <Image
                                          src="/stx-logo.png"
                                          alt="Stacks Logo"
                                          width={24}
                                          height={24}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                      <span className="font-medium text-sm">Stacks (STX)</span>
                                    </div>
                                    <Badge variant="secondary" className="font-mono text-xs">Standard</Badge>
                                  </div>
                                  <div className="mt-2 font-mono text-xs bg-background/80 p-2 rounded break-all">
                                    {stxAddress}
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-2">Used for Stacks blockchain operations and smart contracts</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Usage guidance based on current state */}
                    <div className="p-4 border rounded-lg bg-muted/10 mt-4">
                      <h4 className="text-sm font-medium mb-2">Current Recommendation</h4>

                      {!isBlazeSignerInstalled && (
                        <p className="text-sm text-muted-foreground">
                          <svg className="inline-block mr-1.5" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Connect your SIP30 wallet for all operations and consider installing Signet
                          for enhanced features like subnet deployment.
                        </p>
                      )}

                      {isBlazeSignerInstalled && blazeState !== 'unlocked' && (
                        <p className="text-sm text-muted-foreground">
                          <svg className="inline-block mr-1.5" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Unlock your Signet Signer for advanced features. Use your SIP30 wallet
                          for standard transactions in the meantime.
                        </p>
                      )}

                      {blazeState === 'unlocked' && !walletConnected && (
                        <p className="text-sm text-muted-foreground">
                          <svg className="inline-block mr-1.5" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Your Signet Signer is active. For full functionality, also connect
                          your SIP30 wallet for Bitcoin operations.
                        </p>
                      )}

                      {blazeState === 'unlocked' && walletConnected && (
                        <p className="text-sm text-muted-foreground">
                          <svg className="inline-block mr-1.5" width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 6H10M10 6L6.5 2.5M10 6L6.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          You're fully connected! You can use Signet for most operations
                          and your SIP30 wallet when needed.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="advanced">
            <div className="grid gap-6">
              {/* Dexterity Configuration Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="size-5" />
                        Dexterity SDK Configuration
                      </CardTitle>
                      <CardDescription>
                        Configure how Charisma interacts with the Stacks blockchain
                      </CardDescription>
                    </div>
                    {activeSigner && (
                      <Badge className={cn(
                        "font-normal px-2.5 py-1",
                        dexteritySignerSource === 'blaze'
                          ? "bg-cyan-500/10 text-cyan-500 border-cyan-200/10"
                          : "bg-blue-500/10 text-blue-500 border-blue-200/10"
                      )}>
                        {dexteritySignerSource === 'blaze' ? (
                          <Zap className="size-3 mr-1.5" />
                        ) : (
                          <WalletIcon className="size-3 mr-1.5" />
                        )}
                        {activeSigner}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Signer Source Selector */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label htmlFor="signerSource" className="font-medium">Signer Source</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Choose which connected wallet provides the signing capability for transactions
                        </p>
                      </div>
                      <Select
                        value={dexteritySignerSource}
                        onValueChange={(value: 'sip30' | 'blaze') => setDexteritySignerSource(value)}
                        disabled={!walletConnected && blazeState !== 'unlocked'}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sip30" disabled={!walletConnected}>
                            <div className="flex items-center gap-2">
                              <WalletIcon className="size-4" />
                              <span>SIP30 Wallet</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="blaze" disabled={blazeState !== 'unlocked'}>
                            <div className="flex items-center gap-2">
                              <Zap className="size-4" />
                              <span>Signet</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Current Signer Status */}
                    <div className={cn(
                      "rounded-md p-3 mt-3",
                      activeSigner
                        ? (dexteritySignerSource === 'blaze' ? "bg-cyan-500/5 border border-cyan-100/10" : "bg-blue-500/5 border border-blue-100/10")
                        : (!walletConnected && blazeState !== 'unlocked' ? "bg-yellow-500/5 border border-yellow-100" : "bg-muted/30")
                    )}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          "size-2 rounded-full",
                          activeSigner
                            ? (dexteritySignerSource === 'blaze' ? "bg-cyan-500" : "bg-blue-500")
                            : (!walletConnected && blazeState !== 'unlocked' ? "bg-yellow-500/50" : "bg-red-500")
                        )}></div>
                        <h4 className={cn(
                          "text-sm font-medium",
                          activeSigner
                            ? (dexteritySignerSource === 'blaze' ? "text-cyan-600" : "text-blue-600")
                            : (!walletConnected && blazeState !== 'unlocked' ? "text-yellow-600/90" : "")
                        )}>
                          {activeSigner ? `Active Signer: ${activeSigner}` : "No Active Signer"}
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getSignerStatusMessage()}
                      </p>

                      {/* No signers available message */}
                      {!walletConnected && blazeState !== 'unlocked' && (
                        <div className="mt-3 rounded-md bg-primary/10 p-3 border border-primary/20">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="size-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <h5 className="text-sm font-medium text-primary-foreground/50 mb-1">No Signing Source Available</h5>
                              <p className="text-xs text-yellow-700">
                                You need at least one active signing source to perform transactions.
                                Please connect a SIP30 wallet or unlock Signet to proceed.
                              </p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {!walletConnected && (
                                  <Button size="sm" onClick={handleStandardWalletConnection} variant="outline" className="h-8 text-xs border-yellow-300 bg-yellow-100 text-primary-foreground/50 hover:bg-primary/20">
                                    <WalletIcon className="size-3 mr-1.5" /> Connect SIP30 Wallet
                                  </Button>
                                )}
                                {isBlazeSignerInstalled && (
                                  <Button size="sm" onClick={handleBlazeStatusCheck} variant="outline" className="h-8 text-xs border-yellow-300 bg-yellow-100 text-primary-foreground/50 hover:bg-primary/20">
                                    <Zap className="size-3 mr-1.5" /> Check Blaze Status
                                  </Button>
                                )}
                                {!isBlazeSignerInstalled && (
                                  <a
                                    href="https://signet-omega.vercel.app/download.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center h-8 px-2 text-xs rounded border border-yellow-300 bg-yellow-100 text-primary-foreground/50 hover:bg-primary/20"
                                  >
                                    <Zap className="size-3 mr-1.5" /> Install Signet
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Signer capabilities comparison - only show when both are available */}
                      {walletConnected && blazeState === 'unlocked' && (
                        <div className="mt-3 pt-3 border-t border-dashed border-muted">
                          <h5 className="text-xs font-medium mb-2">Signer Capabilities Comparison</h5>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div></div>
                            <div className="text-center font-medium">SIP30 Wallet</div>
                            <div className="text-center font-medium">Signet</div>

                            <div>STX Transactions</div>
                            <div className="text-center text-green-500">✓</div>
                            <div className="text-center text-green-500">✓</div>

                            <div>Bitcoin Transactions</div>
                            <div className="text-center text-green-500">✓</div>
                            <div className="text-center text-red-500">✗</div>

                            <div>Subnet Integration</div>
                            <div className="text-center text-red-500">✗</div>
                            <div className="text-center text-green-500">✓</div>

                            <div>Gas-Free Transactions</div>
                            <div className="text-center text-red-500">✗</div>
                            <div className="text-center text-green-500">✓</div>
                          </div>
                        </div>
                      )}

                      {/* Partial configuration - if only one signer type is available */}
                      {((walletConnected && blazeState !== 'unlocked') || (!walletConnected && blazeState === 'unlocked')) && (
                        <div className="mt-3 pt-3 border-t border-dashed border-muted">
                          <h5 className="text-xs font-medium mb-2">
                            {walletConnected ? "SIP30 Wallet Active" : "Signet Active"}
                          </h5>
                          <p className="text-xs text-muted-foreground mb-3">
                            {walletConnected ?
                              "You're using a SIP30 wallet for signing. For subnet capabilities, install and unlock Signet." :
                              "You're using Signet for signing. For Bitcoin operations, connect a SIP30 wallet."}
                          </p>

                          {walletConnected && !isBlazeSignerInstalled && (
                            <a
                              href="https://github.com/Trust-Machines/signet/releases"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline text-xs flex items-center"
                            >
                              <PlusIcon className="size-3 mr-1" /> Install Signet for enhanced features
                            </a>
                          )}

                          {!walletConnected && blazeState === 'unlocked' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleStandardWalletConnection}
                              className="h-8 text-xs"
                            >
                              <WalletIcon className="size-3 mr-1.5" /> Connect SIP30 Wallet
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connection Requirements */}
                  <div className="rounded-md border p-3 mb-2">
                    <h4 className="text-sm font-medium mb-2">Connection Requirements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "size-3 rounded-full",
                          walletConnected ? "bg-green-500" : "bg-gray-300",
                          dexteritySignerSource === 'sip30' && walletConnected && "ring-2 ring-offset-1 ring-green-300"
                        )}></div>
                        <span className={cn(
                          "text-xs",
                          dexteritySignerSource === 'sip30' && walletConnected && "font-medium"
                        )}>SIP30 Wallet Connection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "size-3 rounded-full",
                          blazeState === 'unlocked' ? "bg-green-500" : "bg-gray-300",
                          dexteritySignerSource === 'blaze' && blazeState === 'unlocked' && "ring-2 ring-offset-1 ring-green-300"
                        )}></div>
                        <span className={cn(
                          "text-xs",
                          dexteritySignerSource === 'blaze' && blazeState === 'unlocked' && "font-medium"
                        )}>Signet (Unlocked)</span>
                      </div>
                    </div>
                  </div>

                  {/* Current Configuration */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium">Current Configuration</h4>
                      <Button variant="outline" size="sm" onClick={handleRefreshConfig}>
                        <RefreshCw className="size-3 mr-1" /> Refresh
                      </Button>
                    </div>
                    <div className="rounded-md bg-muted p-3 font-mono text-xs">
                      <div className="grid grid-cols-2 gap-y-2">
                        <span>mode:</span><span className="text-green-500">client</span>
                        <span>stxAddress:</span>
                        <div className="truncate flex items-center">
                          <span className="truncate">{dexterityConfig?.stxAddress || 'Not set'}</span>
                          {dexterityConfig?.stxAddress && (
                            <button
                              className="ml-1 text-muted-foreground hover:text-primary"
                              onClick={() => {
                                navigator.clipboard.writeText(dexterityConfig.stxAddress);
                                toast({
                                  title: "Address Copied",
                                  description: "STX address copied to clipboard",
                                  variant: "default"
                                });
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 4V16C8 16.5304 8.21071 17.0391 8.58579 17.4142C8.96086 17.7893 9.46957 18 10 18H18C18.5304 18 19.0391 17.7893 19.4142 17.4142C19.7893 17.0391 20 16.5304 20 16V7.242C20 6.97556 19.9467 6.71181 19.8433 6.46624C19.7399 6.22068 19.5885 5.99824 19.398 5.812L16.188 2.602C16.0018 2.41148 15.7793 2.26011 15.5338 2.15673C15.2882 2.05334 15.0244 2.00001 14.758 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16 18V20C16 20.5304 15.7893 21.0391 15.4142 21.4142C15.0391 21.7893 14.5304 22 14 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <span>maxHops:</span><span>{maxHops}</span>
                        <span>slippage:</span><span>{(slippage * 100).toFixed(1)}%</span>
                        <span>signedBy:</span>
                        <span className={dexteritySignerSource === 'blaze' ? "text-cyan-500" : "text-blue-500"}>
                          {activeSigner || 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <InfoIcon className="size-3.5" />
                    <p>Dexterity SDK powers all trading functionality. Configuration changes apply immediately.</p>
                  </div>
                </CardFooter>
              </Card>

              {/* Swap Settings Card (Enhanced) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SlidersHorizontal className="size-5" />
                    Swap Settings
                  </CardTitle>
                  <CardDescription>
                    Configure parameters for token swaps and routing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Slippage Tolerance with Enhanced UI */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="slippage" className="font-medium">Slippage Tolerance</Label>
                      <HoverCard>
                        <HoverCardTrigger>
                          <InfoIcon className="size-4 text-muted-foreground cursor-pointer" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <h4 className="font-medium mb-2">About Slippage Tolerance</h4>
                          <p className="text-sm">
                            Slippage is the difference between the expected price of a trade and the price when the trade is executed.
                            Setting a higher tolerance allows trades to complete in volatile conditions, but may result in receiving fewer tokens than expected.
                          </p>
                          <div className="mt-2 text-xs">
                            <span className="text-green-500 font-medium">Recommended: 0.5% - 1%</span>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          id="slippage"
                          type="range"
                          min="0.1"
                          max="5"
                          step="0.1"
                          value={slippage * 100}
                          onChange={(e) => setSlippage(Number(e.target.value) / 100)}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0.1%</span>
                          <span>1%</span>
                          <span>5%</span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        {[0.005, 0.01, 0.05].map((value) => (
                          <Button
                            key={value}
                            variant={slippage === value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSlippage(value)}
                            className="px-2 py-1 h-auto text-xs"
                          >
                            {(value * 100).toFixed(1)}%
                          </Button>
                        ))}
                        <div className="relative">
                          <input
                            type="number"
                            min="0.1"
                            max="50"
                            step="0.1"
                            value={(slippage * 100).toFixed(1)}
                            onChange={(e) => setSlippage(Number(e.target.value) / 100)}
                            className={cn(
                              "w-16 h-8 px-2 rounded-md border text-center text-sm bg-accent-foreground",
                              slippage > 0.03 ? "text-yellow-500 border-yellow-500" : ""
                            )}
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs pointer-events-none">%</span>
                        </div>
                      </div>
                    </div>

                    {slippage > 0.03 && (
                      <p className="text-xs text-yellow-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="size-3" />
                        High slippage values may result in unfavorable exchange rates
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Routing Depth with Enhanced UI */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="maxHops" className="font-medium">Maximum Routing Depth</Label>
                      <HoverCard>
                        <HoverCardTrigger>
                          <InfoIcon className="size-4 text-muted-foreground cursor-pointer" />
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <h4 className="font-medium mb-2">About Routing Depth</h4>
                          <p className="text-sm">
                            Controls how many intermediate tokens can be used in a swap route.
                            Higher values can find better rates but take longer to calculate and may cost more in fees.
                          </p>
                          <div className="mt-2 text-xs grid grid-cols-3 gap-2">
                            <div>
                              <span className="font-medium block">1 hop:</span>
                              <span className="text-xs">Direct swap only</span>
                            </div>
                            <div>
                              <span className="font-medium block">2-3 hops:</span>
                              <span className="text-xs">Balance of speed and rates</span>
                            </div>
                            <div>
                              <span className="font-medium block">4+ hops:</span>
                              <span className="text-xs">Best rates, slower calculation</span>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          id="maxHops"
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={maxHops}
                          onChange={(e) => setMaxHops(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Direct</span>
                          <span>Balance</span>
                          <span>Optimal</span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <Button
                            key={value}
                            variant={maxHops === value ? "default" : "outline"}
                            size="sm"
                            onClick={() => setMaxHops(value)}
                            className="px-2 py-1 h-auto text-xs min-w-8"
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="size-3" />
                      Current setting: {getRoutingDepthDescription()}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <InfoIcon className="size-3.5" />
                    <p>These settings apply to all swaps performed through Charisma's interface.</p>
                  </div>
                </CardFooter>
              </Card>

              {/* Performance Settings Card */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Gauge className="size-5" />
                        Performance Settings
                      </CardTitle>
                      <CardDescription>
                        Optimize application performance and data loading
                      </CardDescription>
                    </div>
                    {!PERFORMANCE_FEATURES_SUPPORTED && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 font-normal">
                        <AlertCircle className="size-3 mr-1" />
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cache Duration */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <Label htmlFor="cacheTime" className="font-medium">Price Quote Cache Duration</Label>
                        <HoverCard>
                          <HoverCardTrigger>
                            <InfoIcon className="size-3.5 text-muted-foreground cursor-pointer" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <h4 className="font-medium mb-2">About Cache Duration</h4>
                            <p className="text-sm">
                              Controls how long price quotes are cached before requesting fresh data.
                              Lower values provide more accurate prices but increase API usage.
                            </p>
                            {!PERFORMANCE_FEATURES_SUPPORTED && (
                              <div className="mt-2 p-2 rounded bg-yellow-500/10 text-xs text-yellow-700">
                                <span className="font-medium">Feature coming soon:</span> This setting will be enabled
                                in a future SDK update. Currently, a default cache of 30 seconds is used.
                              </div>
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <Select
                        value={cacheTime.toString()}
                        onValueChange={(value) => setCacheTime(Number(value))}
                        disabled={!PERFORMANCE_FEATURES_SUPPORTED}
                      >
                        <SelectTrigger className={cn("w-[140px]", !PERFORMANCE_FEATURES_SUPPORTED && "opacity-60")}>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No Cache</SelectItem>
                          <SelectItem value="10000">10 seconds</SelectItem>
                          <SelectItem value="30000">30 seconds</SelectItem>
                          <SelectItem value="60000">1 minute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className={cn("text-xs text-muted-foreground", !PERFORMANCE_FEATURES_SUPPORTED && "opacity-60")}>
                      {cacheTime === 0
                        ? "Always fetch fresh prices (lowest latency, highest accuracy)"
                        : `Cache price quotes for ${cacheTime / 1000} seconds (reduces API calls)`}
                    </p>
                  </div>

                  <Separator />

                  {/* Data Prefetching */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-2 items-center">
                        <div>
                          <Label className="font-medium">Data Prefetching</Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Preload data for faster response times
                          </p>
                        </div>
                        <HoverCard>
                          <HoverCardTrigger>
                            <InfoIcon className="size-3.5 text-muted-foreground cursor-pointer" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <h4 className="font-medium mb-2">About Data Prefetching</h4>
                            <p className="text-sm">
                              When enabled, the app will proactively load token data and price information before you need it,
                              resulting in a more responsive interface but higher network usage.
                            </p>
                            {!PERFORMANCE_FEATURES_SUPPORTED && (
                              <div className="mt-2 p-2 rounded bg-yellow-500/10 text-xs text-yellow-700">
                                <span className="font-medium">Feature coming soon:</span> This setting will be enabled
                                in a future SDK update. Currently, data is loaded on demand only.
                              </div>
                            )}
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                      <Switch
                        checked={dataPrefetch}
                        onCheckedChange={setDataPrefetch}
                        disabled={!PERFORMANCE_FEATURES_SUPPORTED}
                      />
                    </div>

                    <div className={cn("grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-2", !PERFORMANCE_FEATURES_SUPPORTED && "opacity-60")}>
                      <div className="flex items-start gap-1.5">
                        <PlusIcon className="size-3 mt-0.5 text-green-500" />
                        <span>Faster UI response</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MinusIcon className="size-3 mt-0.5 text-red-500" />
                        <span>Increased data usage</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <PlusIcon className="size-3 mt-0.5 text-green-500" />
                        <span>Better swap experience</span>
                      </div>
                      <div className="flex items-start gap-1.5">
                        <MinusIcon className="size-3 mt-0.5 text-red-500" />
                        <span>Higher initial load time</span>
                      </div>
                    </div>
                  </div>

                  {!PERFORMANCE_FEATURES_SUPPORTED && (
                    <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-primary-foreground/50 text-sm flex items-center gap-2 mt-2">
                      <AlertCircle className="size-4 flex-shrink-0" />
                      <div>
                        <p className="font-medium">Performance settings are not supported in current SDK version</p>
                        <p className="text-xs mt-1">These options will be enabled in an upcoming release. For now, default values are being used.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Developer Tools Card (Expandable) */}
              <Collapsible className="w-full">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="flex w-full justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="size-4" />
                      <span>Developer Tools</span>
                      {!DEVELOPER_FEATURES_SUPPORTED && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 text-xs font-normal">
                          <AlertCircle className="size-3 mr-1" />
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className="size-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2 border-dashed">
                    <CardContent className="pt-6 space-y-4">
                      {/* Warning Banner */}
                      {!DEVELOPER_FEATURES_SUPPORTED && (
                        <div className="rounded-lg border border-primary/20 bg-primary/10 p-3 text-primary-foreground/50 text-sm flex items-center gap-2 mb-4">
                          <AlertCircle className="size-4 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Developer settings are not supported in current SDK version</p>
                            <p className="text-xs mt-1">These options will be enabled in an upcoming release. Your preferences will be saved for when they become available.</p>
                          </div>
                        </div>
                      )}

                      {/* Transaction Mode */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2 items-center">
                            <Label htmlFor="transactionMode" className="font-medium">Transaction Mode</Label>
                            <HoverCard>
                              <HoverCardTrigger>
                                <InfoIcon className="size-3.5 text-muted-foreground cursor-pointer" />
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <h4 className="font-medium mb-2">About Transaction Modes</h4>
                                <p className="text-sm">
                                  Choose how transactions are processed:
                                </p>
                                <ul className="text-xs mt-2 space-y-1.5">
                                  <li><span className="font-medium">Standard:</span> Normal on-chain transactions with default behavior</li>
                                  <li><span className="font-medium">Sponsored:</span> Transactions without requiring the user to pay fees</li>
                                  <li><span className="font-medium">Optimistic:</span> UI updates immediately before blockchain confirmation</li>
                                </ul>
                                {!DEVELOPER_FEATURES_SUPPORTED && (
                                  <div className="mt-2 p-2 rounded bg-yellow-500/10 text-xs text-yellow-700">
                                    <span className="font-medium">Feature coming soon:</span> Additional transaction modes will be enabled
                                    in a future SDK update. Currently, only standard transactions are supported.
                                  </div>
                                )}
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                          <Select
                            value={transactionMode}
                            onValueChange={setTransactionMode}
                            disabled={!DEVELOPER_FEATURES_SUPPORTED}
                          >
                            <SelectTrigger className={cn("w-[160px]", !DEVELOPER_FEATURES_SUPPORTED && "opacity-60")}>
                              <SelectValue placeholder="Select mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="sponsored">Sponsored (Fee-Free)</SelectItem>
                              <SelectItem value="optimistic">Optimistic Execution</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className={cn("text-xs text-muted-foreground", !DEVELOPER_FEATURES_SUPPORTED && "opacity-60")}>
                          {getTransactionModeDescription()}
                        </p>
                      </div>

                      <Separator />

                      {/* Debug Mode */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2 items-center">
                            <div>
                              <Label className="font-medium">Debug Mode</Label>
                              <p className={cn("text-sm text-muted-foreground mt-1", !DEVELOPER_FEATURES_SUPPORTED && "opacity-80")}>
                                Show detailed transaction logs in console
                              </p>
                            </div>
                            <HoverCard>
                              <HoverCardTrigger>
                                <InfoIcon className="size-3.5 text-muted-foreground cursor-pointer" />
                              </HoverCardTrigger>
                              <HoverCardContent className="w-80">
                                <h4 className="font-medium mb-2">About Debug Mode</h4>
                                <p className="text-sm">
                                  When enabled, detailed transaction logs and SDK operations will be printed to the browser console.
                                  This is useful for developers troubleshooting issues.
                                </p>
                                {!DEVELOPER_FEATURES_SUPPORTED && (
                                  <div className="mt-2 p-2 rounded bg-yellow-500/10 text-xs text-yellow-700">
                                    <span className="font-medium">Feature coming soon:</span> Debug mode will be enabled
                                    in a future SDK update. Currently, only standard logging is available.
                                  </div>
                                )}
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                          <Switch
                            checked={debugMode}
                            onCheckedChange={setDebugMode}
                            disabled={!DEVELOPER_FEATURES_SUPPORTED}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* API URL Override */}
                      <div className="space-y-2">
                        <div className="flex gap-2 items-center">
                          <Label htmlFor="apiOverride" className="font-medium">API Endpoint Override</Label>
                          <HoverCard>
                            <HoverCardTrigger>
                              <InfoIcon className="size-3.5 text-muted-foreground cursor-pointer" />
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <h4 className="font-medium mb-2">About API Override</h4>
                              <p className="text-sm">
                                Allows you to specify a custom API endpoint for Dexterity operations.
                                This should only be modified if instructed by the development team.
                              </p>
                              {!DEVELOPER_FEATURES_SUPPORTED && (
                                <div className="mt-2 p-2 rounded bg-yellow-500/10 text-xs text-yellow-700">
                                  <span className="font-medium">Feature coming soon:</span> API endpoint override will be enabled
                                  in a future SDK update. Currently, only the default endpoint is used.
                                </div>
                              )}
                            </HoverCardContent>
                          </HoverCard>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            id="apiOverride"
                            value={apiOverride}
                            onChange={(e) => setApiOverride(e.target.value)}
                            placeholder="https://api.example.com"
                            className={cn("font-mono text-xs", !DEVELOPER_FEATURES_SUPPORTED && "opacity-60")}
                            disabled={!DEVELOPER_FEATURES_SUPPORTED}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setApiOverride('')}
                            disabled={!apiOverride || !DEVELOPER_FEATURES_SUPPORTED}
                          >
                            Reset
                          </Button>
                        </div>
                        <p className={cn("text-xs text-muted-foreground", !DEVELOPER_FEATURES_SUPPORTED && "opacity-60")}>
                          Only modify if instructed by development team
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t pt-4 flex justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="size-3.5 text-yellow-600" />
                        <p className="text-xs text-yellow-600">
                          Developer settings may cause unexpected behavior
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetAllDeveloperSettings}
                        disabled={!DEVELOPER_FEATURES_SUPPORTED}
                      >
                        Reset All
                      </Button>
                    </CardFooter>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="grid gap-6">
              {/* Account Security Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="size-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>
                    Protect your account with additional security measures
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Security Status Overview */}
                  <div className="rounded-lg border p-4 bg-muted/20">
                    <h3 className="text-sm font-medium mb-3">Account Security Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "size-3 rounded-full",
                            user?.passwordEnabled ? "bg-green-500" : "bg-gray-500"
                          )}></div>
                          <span className="text-sm">Password</span>
                        </div>
                        <Badge variant={user?.passwordEnabled ? "outline" : "destructive"} className="font-normal">
                          {user?.passwordEnabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "size-3 rounded-full",
                            user?.twoFactorEnabled ? "bg-green-500" : "bg-amber-500"
                          )}></div>
                          <span className="text-sm">Two-Factor Authentication</span>
                        </div>
                        <Badge
                          variant={user?.twoFactorEnabled ? "outline" : "secondary"}
                          className={cn("font-normal",
                            user?.twoFactorEnabled
                              ? "bg-green-500/10 text-green-500 border-green-200"
                              : ""
                          )}
                        >
                          {user?.twoFactorEnabled ? "Enabled" : "Recommended"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "size-3 rounded-full",
                            user?.emailAddresses?.some(email => email.verification.status === "verified")
                              ? "bg-green-500"
                              : "bg-red-500"
                          )}></div>
                          <span className="text-sm">Email Verification</span>
                        </div>
                        <Badge
                          variant={user?.emailAddresses?.some(email => email.verification.status === "verified")
                            ? "outline"
                            : "destructive"
                          }
                          className="font-normal"
                        >
                          {user?.emailAddresses?.some(email => email.verification.status === "verified")
                            ? "Verified"
                            : "Unverified"
                          }
                        </Badge>
                      </div>
                    </div>

                    {/* Security Score */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Security Score</span>
                        <span className="text-sm font-medium">
                          {user?.twoFactorEnabled && user?.passwordEnabled ? "Strong" :
                            user?.passwordEnabled ? "Medium" : "Weak"}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            user?.twoFactorEnabled && user?.passwordEnabled
                              ? "bg-green-500 w-full"
                              : user?.passwordEnabled
                                ? "bg-amber-500 w-2/3"
                                : "bg-gray-500 w-1/3"
                          )}
                        ></div>
                      </div>

                      {!user?.twoFactorEnabled && (
                        <p className="text-xs mt-2 text-muted-foreground">
                          Enable two-factor authentication to strengthen your account security.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Label className="font-medium">Two-Factor Authentication</Label>
                          {user?.twoFactorEnabled && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-200 font-normal">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Button
                        variant={user?.twoFactorEnabled ? "outline" : "default"}
                        size="sm"
                        onClick={() => {
                          clerk.openUserProfile();
                        }}
                      >
                        {user?.twoFactorEnabled ? "Manage" : "Enable"}
                      </Button>
                    </div>

                    {user?.twoFactorEnabled ? (
                      <div className="p-3 rounded-md bg-green-500/5 border border-green-100 text-xs flex items-start gap-2">
                        <div className="text-green-500 mt-0.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8 12L10.5 14.5L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-green-700">Two-factor authentication is enabled</p>
                          <p className="text-muted-foreground mt-1">Your account has an additional layer of security.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-md bg-amber-500/5 border border-amber-100/20 text-xs flex items-start gap-2">
                        <div className="text-amber-500 mt-0.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 16H12.01M12 8V12M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-amber-700">Two-factor authentication is recommended</p>
                          <p className="text-muted-foreground mt-1">Enable 2FA for additional protection against unauthorized access.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Password Management */}
                  {user?.passwordEnabled && <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Label className="font-medium">Password</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Update your password regularly for better security
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          clerk.openUserProfile();
                        }}
                      >
                        Change
                      </Button>
                    </div>

                    <div className="p-3 rounded-md bg-muted/30 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Password best practices:</span>
                      </div>
                      <ul className="space-y-1.5 text-muted-foreground list-disc pl-4">
                        <li>Use at least 12 characters with a mix of letters, numbers, and symbols</li>
                        <li>Avoid using personal information like birthdays or names</li>
                        <li>Don't reuse passwords across different websites</li>
                        <li>Change your password every 3-6 months</li>
                      </ul>
                    </div>
                  </div>}

                  {user?.passwordEnabled && <Separator />}

                  {/* Session Management */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Label className="font-medium">Session Management</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          View and manage your active sessions
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          clerk.openUserProfile();
                        }}
                      >
                        Manage
                      </Button>
                    </div>

                    <div className="p-3 rounded-md bg-muted/30 flex items-start gap-2 text-xs">
                      <div className="text-primary mt-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Current session is active on this device</p>
                        <p className="text-muted-foreground mt-1">You can view all active sessions and sign out from other devices.</p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-center gap-2 mt-3 border border-red-500 hover:bg-red-500/10 hover:text-white"
                      onClick={() => {
                        if (confirm('Are you sure you want to sign out?')) {
                          clerk.signOut().then(() => {
                            toast({
                              title: "Signed Out",
                              description: "You have been signed out successfully.",
                              variant: "default"
                            });
                          });
                        }
                      }}
                    >
                      <LogOut className="size-4" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Security Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-foreground">
                      <path d="M12 1V3M12 21V23M4.2 4.2L5.6 5.6M18.4 18.4L19.8 19.8M1 12H3M21 12H23M4.2 19.8L5.6 18.4M18.4 5.6L19.8 4.2M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Advanced Security
                  </CardTitle>
                  <CardDescription>
                    Additional security options and account recovery
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Recovery Options */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Label className="font-medium">Recovery Email</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Set an alternative email for account recovery
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          clerk.openUserProfile()
                        }
                      >
                        Manage
                      </Button>
                    </div>

                    <div className="p-3 rounded-md bg-muted/30 flex items-start gap-2 text-xs">
                      <div className="text-muted-foreground mt-0.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 8V16C21 17.1046 20.1046 18 19 18H5C3.89543 18 3 17.1046 3 16V8M21 8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8M21 8V8.5L12 13L3 8.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Recovery methods help when you can't sign in</p>
                        <p className="text-muted-foreground mt-1">Add a backup email to ensure you can always recover your account.</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Login History */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <Label className="font-medium">Login History</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Review recent login activity for suspicious behavior
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          clerk.openUserProfile()
                        }
                      >
                        View
                      </Button>
                    </div>

                    <div className="border rounded-md overflow-hidden">
                      <div className="px-3 py-2 bg-muted/30 text-xs font-medium">Recent Activity</div>
                      <div className="p-3 text-xs">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-green-500"></div>
                              <span>Current Session</span>
                            </div>
                            <span className="text-muted-foreground">Just now</span>
                          </div>
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <div className="size-2 rounded-full bg-muted"></div>
                              <span>Previous Login</span>
                            </div>
                            <span className="text-muted-foreground">
                              {(user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleString() : 'Unknown')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout >
  );
}