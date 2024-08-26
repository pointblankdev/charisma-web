import {
    Coins,
    Gavel,
    Scale,
    Send,
    Settings,
    Share,
    Swords,
    Trophy,
    Vote,
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
import Layout from "@components/layout/layout"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import SyntaxHighlighter from 'react-syntax-highlighter';
import { useEffect, useState } from "react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { motion } from 'framer-motion';
import { BsWater } from "react-icons/bs"
import FarmTemplate from "./farm"
import { PiPackage, PiPlant } from "react-icons/pi"
import BattleRoyaleTemplate from "./battle-royale"
import PrizeFightTemplate from "./prize-fight"
import { useAccount, useOpenContractDeploy } from "@micro-stacks/react"
import NftCollectionTemplate from "./nfts"
import { isEmpty } from "lodash"

const extentionRequestProposal = ({ contractAddress }: any) => {
    return `(define-public (execute (sender principal))
    (begin
      ;; set the new contract as an extension
      (try! (contract-call? 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.dungeon-master set-extension '${contractAddress} true))
      ;; enable the latest energy contract for use
      (try! (contract-call? '${contractAddress} set-whitelisted-edk 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.land-helper-v2 true))
      (ok true)
    )
  )
  `}

const generateHeader = ({ name, sender }: any) => {
    return `;; Title: ${name}
;; Author: ${sender}
;; Created With Charisma
;; https://charisma.rocks

`}

const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const contractFormSchema = z.object({
    template: z.string(),
    name: z.string().max(32, "Names have a max length of 32 characters, since they are used in the contract address"),
})

type ContractFormValues = z.infer<typeof contractFormSchema>

export default function ContractDeployer({ data }: any) {

    const { stxAddress } = useAccount()

    const [loading, setLoading] = useState(true);

    const [template, setTemplate] = useState<string>('nfts')
    const [body, setBody] = useState<string>('')
    const [header, setHeader] = useState<string>('')

    useEffect(() => {
        setLoading(false);
    }, []);

    const sender = stxAddress!

    const defaultValues: Partial<ContractFormValues> = {
        template: 'nfts'
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


    const { openContractDeploy } = useOpenContractDeploy();

    const deployContract = (e: any) => {
        e.preventDefault()
        const name = form.getValues().name
        const safeName = name.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-")
        openContractDeploy({
            contractName: safeName,
            codeBody: `${header}${body}`,
        });
    }

    const deployProposal = (e: any) => {
        e.preventDefault()
        const name = form.getValues().name
        const safeName = name.toLowerCase().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-")
        openContractDeploy({
            contractName: `propose-${safeName}`,
            codeBody: extentionRequestProposal({ contractAddress: `${sender}.${safeName}` }),
        });
    }

    return (
        <Layout>
            <div className="grid w-full">
                <Form {...form}>
                    <form onChange={handleHeaderChange}>
                        <div className="flex flex-col">
                            <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
                                <h1 className="text-xl font-semibold grow">Quest Deployer</h1>
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

                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </fieldset>
                                        </div>
                                    </DrawerContent>
                                </Drawer>
                                <div className="space-x-2 flex items-center text-muted-foreground text-xs">
                                    <div>To enable your contract on Charisma, you must deploy the contract and then request community approval.</div>
                                    <Button
                                        // disabled={!isEmpty(form.formState.errors)}
                                        size="sm"
                                        className="ml-auto gap-1.5 text-sm"
                                        onClick={deployContract}
                                    >
                                        <Share className="size-3.5" />
                                        Deploy Contract
                                    </Button>
                                    <Button
                                        // disabled={!isEmpty(form.formState.errors)}
                                        size="sm"
                                        className="ml-auto gap-1.5 text-sm"
                                        onClick={deployProposal}
                                    >
                                        <Scale className="size-3.5" />
                                        Request Community Approval
                                    </Button>
                                </div>
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
                                                                        <SelectItem value="nfts">
                                                                            <div className="flex items-start gap-3 text-foreground">
                                                                                <PiPackage className="size-5" />
                                                                                <div className="grid gap-0.5">
                                                                                    <p>
                                                                                        Utility{" "}
                                                                                        <span className="font-medium text-foreground">
                                                                                            NFT Collection
                                                                                        </span>
                                                                                    </p>
                                                                                    <p className="text-xs" data-description>
                                                                                        Create non-unique utility NFTs to sell on Charisma
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                    {/* <SelectContent>
                                                                        <SelectItem value="farm">
                                                                            <div className="flex items-start gap-3 text-foreground">
                                                                                <PiPlant className="size-5" />
                                                                                <div className="grid gap-0.5">
                                                                                    <p>
                                                                                        Yield{" "}
                                                                                        <span className="font-medium text-foreground">
                                                                                            Farm
                                                                                        </span>
                                                                                    </p>
                                                                                    <p className="text-xs" data-description>
                                                                                        Create an yield farm for rewards
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="battle-royale">
                                                                            <div className="flex items-start gap-3 text-foreground">
                                                                                <Swords className="size-5" />
                                                                                <div className="grid gap-0.5">
                                                                                    <p>
                                                                                        Battle{" "}
                                                                                        <span className="font-medium text-foreground">
                                                                                            Royale
                                                                                        </span>
                                                                                    </p>
                                                                                    <p className="text-xs" data-description>
                                                                                        Create a battle royale quest for tokens
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </SelectItem>
                                                                        <SelectItem value="prize-fight">
                                                                            <div className="flex items-start gap-3 text-foreground">
                                                                                <Trophy className="size-5" />
                                                                                <div className="grid gap-0.5">
                                                                                    <p>
                                                                                        Prize{" "}
                                                                                        <span className="font-medium text-foreground">
                                                                                            Fight
                                                                                        </span>
                                                                                    </p>
                                                                                    <p className="text-xs" data-description>
                                                                                        Auction-style bidding of energy for NFTs
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </SelectItem>
                                                                    </SelectContent> */}
                                                                </Select>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </fieldset>
                                        {!loading && <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                                            {template === 'farm' ?
                                                <FarmTemplate onFormChange={handleContractChange} />
                                                : template === 'battle-royale' ?
                                                    <BattleRoyaleTemplate onFormChange={handleContractChange} />
                                                    : template === 'prize-fight' ?
                                                        <PrizeFightTemplate onFormChange={handleContractChange} />
                                                        : template === 'nfts' ?
                                                            <NftCollectionTemplate form={form} onFormChange={handleContractChange} />
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