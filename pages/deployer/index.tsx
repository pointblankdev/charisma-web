import {
    Coins,
    Scale,
    Send,
    Settings,
    Share,
} from "lucide-react"
import { Badge } from "@components/ui/badge"
import { Button } from "@components/ui/button"
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@components/ui/drawer"
import { Input } from "@components/ui/input"
import { Label } from "@components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select"
import Layout from "@components/layout"
import AirdropTemplate from "./airdropper"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useEffect, useState } from "react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { motion } from 'framer-motion';
import IndexTokenTemplate from "./index-token"
import { BsCurrencyExchange } from "react-icons/bs"
import { BiMath } from "react-icons/bi"
import ArbitrageStrategyTemplate from "./strategy"
import { userSession } from "@components/stacks-session/connect"
import { useConnect } from "@stacks/connect-react"
import { PostConditionMode } from "@stacks/transactions"
import { StacksMainnet } from "@stacks/network";
import ProposalTemplate from "./proposal"
import { GetStaticProps } from "next"
import velarApi from "@lib/velar-api"

const generateHeader = ({ name, sender, description }: any) => {
    return `;; Title: ${name}
;; Author: ${sender}
;; Created With Charisma
;; Description:
;; ${description}
;; Unwrap Link:
;; https://www.charisma.rocks/crafting/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.quiet-confidence

`}

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const contractFormSchema = z.object({
    template: z.string(),
    name: z.string().max(24, "Names have a max length of 24 characters, since they are used in the contract address"),
    description: z.string(),
})

type ContractFormValues = z.infer<typeof contractFormSchema>

export default function ContractDeployer({ data }: any) {

    const [loading, setLoading] = useState(true);

    const [template, setTemplate] = useState<string>('proposal')
    const [body, setBody] = useState<string>('')
    const [header, setHeader] = useState<string>('')

    useEffect(() => {
        setLoading(false);
    }, []);

    const sender = userSession.isUserSignedIn() && userSession.loadUserData().profile.stxAddress.mainnet

    const defaultValues: Partial<ContractFormValues> = {
        template: 'proposal'
    }

    const form = useForm<ContractFormValues>({
        resolver: zodResolver(contractFormSchema),
        defaultValues,
        mode: "onChange",
    })

    const handleTemplateChange = (value: string) => {
        setTemplate(value)
    };

    const handleContractChange = (template: string) => {
        setBody(template)
    }

    const handleHeaderChange = () => {
        setHeader(generateHeader({ sender, ...form.getValues() }))
    }

    const { doContractDeploy, doContractCall } = useConnect();

    const deployContract = (e: any) => {
        e.preventDefault()
        const name = form.getValues().name
        const safeName = name.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-")
        doContractDeploy({
            contractName: safeName,
            codeBody: `${header}${body}`,
            postConditionMode: PostConditionMode.Allow,
            network: new StacksMainnet(),
        });
    }

    return (
        <Layout>
            <div className="grid w-full">
                <Form {...form}>
                    <form onChange={handleHeaderChange}>
                        <div className="flex flex-col">
                            <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
                                <h1 className="text-xl font-semibold">Contract Deployer</h1>
                                <Drawer>
                                    <DrawerTrigger asChild>
                                        <Button variant="ghost" size="icon" className="md:hidden">
                                            <Settings className="size-4" />
                                            <span className="sr-only">Settings</span>
                                        </Button>
                                    </DrawerTrigger>
                                    <DrawerContent className="max-h-[80vh]">
                                        <DrawerHeader>
                                            <DrawerTitle>Configuration</DrawerTitle>
                                            <DrawerDescription>
                                                Configure the settings for the model and messages.
                                            </DrawerDescription>
                                        </DrawerHeader>
                                        <div className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
                                            <fieldset className="grid gap-6 rounded-lg border p-4">
                                                <legend className="-ml-1 px-1 text-sm font-medium">
                                                    Configuration
                                                </legend>
                                                <div className="grid gap-3">
                                                    <Label htmlFor="model">Contract Template</Label>
                                                    <Select>
                                                        <SelectTrigger
                                                            id="model"
                                                            className="items-start [&_[data-description]]:hidden"
                                                        >
                                                            <SelectValue placeholder="Select a model" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="genesis">
                                                                <div className="flex items-start gap-3 text-foreground">
                                                                    <Scale className="size-5" />
                                                                    <div className="grid gap-0.5">
                                                                        <p>
                                                                            Governance{" "}
                                                                            <span className="font-medium text-foreground">
                                                                                Proposal
                                                                            </span>
                                                                        </p>
                                                                        <p className="text-xs" data-description>
                                                                            Deploy a new governance proposal.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="explorer">
                                                                <div className="flex items-start gap-3 text-foreground">
                                                                    <Send className="size-5" />
                                                                    <div className="grid gap-0.5">
                                                                        <p>
                                                                            Token{" "}
                                                                            <span className="font-medium text-foreground">
                                                                                Airdropper
                                                                            </span>
                                                                        </p>
                                                                        <p className="text-xs" data-description>
                                                                            Distribute tokens to multiple addresses.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="index">
                                                                <div className="flex items-start gap-3 text-foreground">
                                                                    <Coins className="size-5" />
                                                                    <div className="grid gap-0.5">
                                                                        <p>
                                                                            Index{" "}
                                                                            <span className="font-medium text-foreground">
                                                                                Token
                                                                            </span>
                                                                        </p>
                                                                        <p className="text-xs" data-description>
                                                                            Create a new Charisma index token.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="arbitrage">
                                                                <div className="flex items-start gap-3 text-foreground">
                                                                    <Coins className="size-5" />
                                                                    <div className="grid gap-0.5">
                                                                        <p>
                                                                            Arbitrage{" "}
                                                                            <span className="font-medium text-foreground">
                                                                                Strategy
                                                                            </span>
                                                                        </p>
                                                                        <p className="text-xs" data-description>
                                                                            Create a new Charisma index token.
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </fieldset>
                                        </div>
                                    </DrawerContent>
                                </Drawer>
                                <Button
                                    size="sm"
                                    className="ml-auto gap-1.5 text-sm"
                                    onClick={deployContract}
                                >
                                    <Share className="size-3.5" />
                                    Deploy
                                </Button>
                            </header>
                            <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
                                <div
                                    className="relative hidden flex-col items-start gap-8 md:flex" x-chunk="dashboard-03-chunk-0"
                                >
                                    <div className="grid w-full items-start gap-6">
                                        <fieldset className="grid gap-6 rounded-lg border p-4">
                                            <legend className="-ml-1 px-1 text-sm font-medium">
                                                Configuration
                                            </legend>
                                            <div className="grid gap-3">
                                                <FormField
                                                    control={form.control}
                                                    name="template"
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormLabel>Contract Template</FormLabel>
                                                            <FormControl>
                                                                <Select onValueChange={handleTemplateChange} defaultValue={field.value}>
                                                                    <SelectTrigger
                                                                        id="model"
                                                                        className="items-start [&_[data-description]]:hidden"
                                                                    >
                                                                        <SelectValue placeholder="Select a model" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="proposal">
                                                                            <div className="flex items-start gap-3 text-foreground">
                                                                                <Scale className="size-5" />
                                                                                <div className="grid gap-0.5">
                                                                                    <p>
                                                                                        Governance{" "}
                                                                                        <span className="font-medium text-foreground">
                                                                                            Proposal
                                                                                        </span>
                                                                                    </p>
                                                                                    <p className="text-xs" data-description>
                                                                                        Deploy a new governance proposal.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="airdrop">
                                                                            <div className="flex items-start gap-3 text-foreground">
                                                                                <Send className="size-5" />
                                                                                <div className="grid gap-0.5">
                                                                                    <p>
                                                                                        Token{" "}
                                                                                        <span className="font-medium text-foreground">
                                                                                            Airdropper
                                                                                        </span>
                                                                                    </p>
                                                                                    <p className="text-xs" data-description>
                                                                                        Distribute tokens to multiple addresses.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="index">
                                                                            <div className="flex items-start gap-3 text-foreground">
                                                                                <BsCurrencyExchange className="size-5" />
                                                                                <div className="grid gap-0.5">
                                                                                    <p>
                                                                                        Index{" "}
                                                                                        <span className="font-medium text-foreground">
                                                                                            Token
                                                                                        </span>
                                                                                    </p>
                                                                                    <p className="text-xs" data-description>
                                                                                        Create a new Charisma index token.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="strategy">
                                                                            <div className="flex items-start gap-3 text-foreground">
                                                                                <BiMath className="size-5" />
                                                                                <div className="grid gap-0.5">
                                                                                    <p>
                                                                                        Arbitrage{" "}
                                                                                        <span className="font-medium text-foreground">
                                                                                            Strategy
                                                                                        </span>
                                                                                    </p>
                                                                                    <p className="text-xs" data-description>
                                                                                        Create an multi-step arbitrage trade
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </fieldset>
                                        <fieldset className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                                            <legend className="-ml-1 px-1 text-sm font-medium">
                                                Contract Metadata
                                            </legend>
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem className="w-full">
                                                        <FormLabel>Contract Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder={'A concise contract title'} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem className="w-full">
                                                        <FormLabel>Description</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder={'Some details to explain what the contract is doing'} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </fieldset>
                                        {!loading && <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                                            {template === 'airdrop' ?
                                                <AirdropTemplate onFormChange={handleContractChange} />
                                                : template === 'index' ?
                                                    <IndexTokenTemplate onFormChange={handleContractChange} />
                                                    : template === 'proposal' ?
                                                        <ProposalTemplate onFormChange={handleContractChange} />
                                                        : template === 'strategy' ?
                                                            <ArbitrageStrategyTemplate onFormChange={handleContractChange} />
                                                            : <div>...</div>

                                            }
                                        </motion.div>}
                                    </div>
                                </div>
                                <div className="relative flex h-full bg-black flex-col rounded-lg bg-muted/5 lg:col-span-2 overflow-hidden border m-3">
                                    <Badge variant="outline" className="absolute right-3 top-3">
                                        Output
                                    </Badge>
                                    <SyntaxHighlighter language="lisp" customStyle={{ background: 'black', height: '100%' }} wrapLongLines={true}>
                                        {String(header) + String(body)}
                                    </SyntaxHighlighter>
                                    {/* <div
                                        className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring" x-chunk="dashboard-03-chunk-1"
                                    >
                                        <Label htmlFor="message" className="sr-only">
                                            Message
                                        </Label>
                                        <Textarea
                                            id="message"
                                            placeholder="Type your message here..."
                                            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                                        />
                                        <div className="flex items-center p-3 pt-0">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Paperclip className="size-4" />
                                                            <span className="sr-only">Attach file</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">Attach File</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <Mic className="size-4" />
                                                            <span className="sr-only">Use Microphone</span>
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top">Use Microphone</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <Button type="submit" size="sm" className="ml-auto gap-1.5">
                                                Send Message
                                                <CornerDownLeft className="size-3.5" />
                                            </Button>
                                        </div>
                                    </div> */}
                                </div>
                            </main>
                        </div>
                    </form>
                </Form>
            </div>
        </Layout>
    )
}