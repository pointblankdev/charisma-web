import React, { useEffect } from 'react';
import { Button } from "@components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "@components/ui/input"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAccount } from "@micro-stacks/react"
import { setNftCollectionMetadata, getNftCollectionMetadata } from "@lib/user-api"
import Image from 'next/image'
import { max, over } from 'lodash';
import { Textarea } from '@components/ui/textarea';
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog';
import QuestCard from '@components/quest/quest-card';

const nftItemSchema = z.object({
    itemName: z.string().min(1, "Item name is required"),
    amount: z.coerce.number().min(1, "Amount must be at least 1"),
    itemImage: z.string().url("Must be a valid URL"),
})

const proposalFormSchema = z.object({
    collectionName: z.string().min(1, "Collection name is required"),
    nftItems: z.array(nftItemSchema).min(1, "At least one NFT item is required"),
    overview: z.string(),
    utility: z.string(),
    contractAddress: z.string(),
    totalSupply: z.number(),
    stxAddress: z.string(),
    description: z.string(),
    collectionImage: z.string().url("Must be a valid URL"),
    energyRequired: z.coerce.number().min(1, "Amount must be at least 1"),
    nftName: z.string(),
    stxPerMint: z.coerce.number().min(0.000001, "Amount must be at least 0.000001"),
    maxMintsPerTx: z.coerce.number().min(1, "Amount must be at least 1").max(20, "Amount must be at most 20"),
})

type ProposalFormValues = z.infer<typeof proposalFormSchema>

const generateTemplate = ({ contractAddress, totalSupply, stxAddress, description, energyRequired, nftName, stxPerMint, maxMintsPerTx }: ProposalFormValues) => {
    // Your template generation logic here
    return `;; Description:
;; ${description}

;; This contract implements the SIP-009 community-standard Non-Fungible Token trait
(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; Define the NFT's name
(define-non-fungible-token ${nftName} uint)

;; Keep track of the last minted token ID
(define-data-var last-token-id uint u0)

;; Define constants
(define-constant COLLECTION_LIMIT u${totalSupply}) ;; Limit to series of ${totalSupply}
(define-constant ENERGY_PER_NFT u${energyRequired}) ;; ${energyRequired} energy per NFT
(define-constant STX_PER_MINT u${stxPerMint * 1000000}) ;; ${stxPerMint} STX per MINT for DAO
(define-constant MAX_NFTS_PER_TX u${maxMintsPerTx}) ;; Maximum ${maxMintsPerTx} NFTs per transaction
(define-constant OWNER '${stxAddress}) ;; Collection creator
(define-constant CHA_AMOUNT (* u5 STX_PER_MINT)) ;; ${(5 * stxPerMint).toFixed(6)} CHA per mint to creator

(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_TOKEN_OWNER (err u101))
(define-constant ERR_SOLD_OUT (err u300))
(define-constant ERR_INVALID_EDK (err u400))

(define-data-var base-uri (string-ascii 200) "https://charisma.rocks/api/v0/nfts/${contractAddress}/{id}.json")

;; Whitelisted contract addresses
(define-map whitelisted-edks principal bool)

(define-trait edk-trait
	(
		(tap (uint) (response (tuple (type (string-ascii 256)) (land-id uint) (land-amount uint) (energy uint)) uint))
	)
)

;; Authorization check
(define-private (is-dao-or-extension)
    (or (is-eq tx-sender 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master) (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master is-extension contract-caller))
)

(define-read-only (is-authorized)
    (ok (asserts! (is-dao-or-extension) ERR_UNAUTHORIZED))
)

;; Whitelist functions
(define-public (set-whitelisted-edk (edk principal) (whitelisted bool))
    (begin
        (try! (is-authorized))
        (ok (map-set whitelisted-edks edk whitelisted))
    )
)

(define-read-only (is-whitelisted-edk (edk principal))
    (default-to false (map-get? whitelisted-edks edk))
)

;; SIP-009 function: Get the last minted token ID.
(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

;; SIP-009 function: Get link where token metadata is hosted
(define-read-only (get-token-uri (token-id uint))
  (ok (some (var-get base-uri)))
)

;; Function to update the token URI
(define-public (set-token-uri (new-uri (string-ascii 200)))
  (begin
    (try! (is-authorized))
    (ok (var-set base-uri new-uri))
  )
)

;; SIP-009 function: Get the owner of a given token
(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? ${nftName} token-id))
)

;; SIP-009 function: Transfer NFT token to another owner.
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    ;; #[filter(sender)]
    (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
    (nft-transfer? ${nftName} token-id sender recipient)
  )
)

;; Mint a new NFT.
(define-private (mint (recipient principal))
  ;; Create the new token ID by incrementing the last minted ID.
  (let ((token-id (+ (var-get last-token-id) u1)))
    ;; Ensure the collection stays within the limit.
    (asserts! (< (var-get last-token-id) COLLECTION_LIMIT) ERR_SOLD_OUT)
    ;; Mint the NFT and send it to the given recipient.
    (try! (nft-mint? ${nftName} token-id recipient))
    ;; 1 STX cost send to dungeon-master
    (try! (stx-transfer? STX_PER_MINT tx-sender 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master))
    ;; Mint 1 governance token to the OWNER
    (try! (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token dmg-mint CHA_AMOUNT OWNER))
    ;; Update the last minted token ID.
    (var-set last-token-id token-id)
    ;; Return the newly minted NFT ID.
    (ok token-id)
  )
)

${generateMintMultipleFunction(maxMintsPerTx)}

;; Quest logic
(define-public (tap (land-id uint) (edk-contract <edk-trait>))
    (let
        (
            (tapped-out (unwrap-panic (contract-call? edk-contract tap land-id)))
            (energy (get energy tapped-out))
            (nfts-to-mint (min (/ energy ENERGY_PER_NFT) MAX_NFTS_PER_TX))
        )
        (asserts! (is-whitelisted-edk (contract-of edk-contract)) ERR_INVALID_EDK)
        (mint-multiple tx-sender nfts-to-mint)
    )
)

(define-read-only (get-untapped-amount (land-id uint) (user principal))
    (let
        (
            (untapped-energy (unwrap-panic (contract-call? 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands get-untapped-amount land-id user)))
            (nfts-available (min (/ untapped-energy ENERGY_PER_NFT) MAX_NFTS_PER_TX))
        )
        nfts-available
    )
)

;; Utility function to get the minimum of two uints
(define-private (min (a uint) (b uint))
  (if (<= a b) a b)
)
`;
}

const generateMintMultipleFunction = (maxCount: number) => `
;; Mint multiple NFTs based on the count (1 to ${maxCount})
(define-private (mint-multiple (recipient principal) (count uint))
  ${generateMintCases(maxCount)}`;

const generateMintCases = (maxCount: number) => {
    let cases = '';
    for (let i = 1; i <= maxCount; i++) {
        if (i === 1) {
            cases += `(if (is-eq count u1) (mint recipient)`;
        } else {
            cases += `\n  (if (is-eq count u${i}) (begin ${generateMintCalls(i)})`;
        }
    }
    cases += `\n  (err u500)\n`;
    for (let i = 0; i <= maxCount; i++) {
        cases += ')';
    }
    return cases;
};

const generateMintCalls = (count: number) => {
    let calls = '';
    for (let i = 1; i <= count; i++) {
        if (i === count) {
            calls += `(mint recipient)`;
        } else {
            calls += `(try! (mint recipient)) `;
        }
    }
    return calls;
};

const ImagePreview = ({ src }: { src: string }) => {
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(false);

    return (
        <div className="relative w-24 h-24 mt-2 border rounded overflow-hidden">
            {isLoading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    Loading...
                </div>
            )}
            {error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 text-red-500">
                    Error
                </div>
            ) : (
                <Image
                    src={src}
                    alt="NFT Preview"
                    layout="fill"
                    objectFit="cover"
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setError(true);
                    }}
                />
            )}
        </div>
    );
};

export default function NftTemplate({ form: parentForm, onFormChange }: any) {
    const { stxAddress } = useAccount()

    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalFormSchema),
        defaultValues: {
            collectionName: '',
            nftItems: [{ itemName: '', amount: 0, itemImage: '' }],
            maxMintsPerTx: 4,
        },
        mode: "onChange",
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "nftItems",
    })

    const handleChange = () => {
        const collectionName = form.getValues().collectionName
        const safeName = collectionName.toLowerCase().replace(/[^a-zA-Z0-9\- ]/g, "").replace(/\s+/g, "-")
        const contractAddress = `${stxAddress}.${safeName}`
        parentForm.setValue('name', collectionName)

        const totalSupply = form.getValues().nftItems.reduce((sum, item) => sum + Number(item.amount), 0)

        const template = generateTemplate({ ...form.getValues(), contractAddress, totalSupply, stxAddress: stxAddress!, nftName: safeName })
        onFormChange(template)
    }

    const handleSubmitCollection = async (e: React.MouseEvent) => {
        e.preventDefault()
        const { collectionName, collectionImage, description, nftItems, stxPerMint, energyRequired, maxMintsPerTx, overview, utility } = form.getValues();
        const safeName = collectionName.toLowerCase().replace(/[^a-zA-Z0-9\- ]/g, "").replace(/\s+/g, "-")
        const contractAddress = `${stxAddress}.${safeName}`

        // Calculate total supply
        const totalSupply = nftItems.reduce((sum, item) => sum + Number(item.amount), 0)

        const metadata = {
            sip: 16,
            name: collectionName,
            description: {
                type: "string",
                description: description
            },
            attributes: [],
            properties: {
                collection: collectionName,
                collection_image: collectionImage,
                category: "image",
                total_supply: totalSupply,
                items: nftItems.map(item => ({
                    name: item.itemName,
                    amount: Number(item.amount),
                    image_url: item.itemImage
                })),
                stx_mint_cost: stxPerMint,
                energy_required: energyRequired,
                max_mints_per_tx: maxMintsPerTx,
                overview: overview,
                utility: utility,
                whitelisted: false
            }
        }

        try {
            const response = await setNftCollectionMetadata(contractAddress, metadata)
            console.log("Collection submitted successfully:", response)
            // Here you might want to show a success message to the user
        } catch (error) {
            console.error("Error submitting collection:", error)
            // Here you might want to show an error message to the user
        }
    }

    const loadExistingCollection = async (contractAddress: string) => {

        try {
            const metadata = await getNftCollectionMetadata(contractAddress)
            if (metadata) {
                form.setValue('collectionName', metadata.name)
                form.setValue('description', metadata.description.description)
                form.setValue('collectionImage', metadata.properties.collection_image)
                form.setValue('nftItems', metadata.properties.items.map((item: any) => ({
                    itemName: item.name,
                    amount: Number(item.amount),
                    itemImage: item.image_url
                })))
            }
        } catch (error) {
            console.error("Error loading collection:", error)
            // Here you might want to show an error message to the user
        }
    }

    const watcher = form.watch('collectionName')

    useEffect(() => {
        const collectionName = form.getValues().collectionName
        const safeName = collectionName.toLowerCase().replace(/[^a-zA-Z0-9\- ]/g, "").replace(/\s+/g, "-")
        const contractAddress = `${stxAddress}.${safeName}`
        loadExistingCollection(contractAddress)
    }, [watcher])

    return (
        <Form {...form}>
            <form onChange={handleChange} className="space-y-4">
                <fieldset className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                        Collection
                    </legend>
                    <FormField
                        control={form.control}
                        name="collectionName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder={'Spell Scrolls'} {...field} />
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
                                    <Input placeholder={'One sentence description of your utility NFT collection.'} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`collectionImage`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Collection Image</FormLabel>
                                <FormControl>
                                    <Input placeholder={'https://example.com/images/nft-image.png'} {...field} />
                                </FormControl>
                                <FormMessage />
                                {field.value && <ImagePreview src={field.value} />}
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="overview"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Overview</FormLabel>
                                <FormControl>
                                    <Textarea placeholder={'A paragraph explaining the story behind your utility NFT, and why someone might want to collect it.'} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="utility"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Utility</FormLabel>
                                <FormControl>
                                    <Input placeholder={'One sentence explanation for proposed NFT utility in Charisma.'} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </fieldset>

                <fieldset className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                        NFT Definitions
                    </legend>
                    {fields.map((field, index) => (
                        <div key={field.id} className="space-y-4">
                            <div className="flex space-x-2">
                                <FormField
                                    control={form.control}
                                    name={`nftItems.${index}.itemName`}
                                    render={({ field }) => (
                                        <FormItem className="flex-grow">
                                            <FormLabel>Item Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder={'Fire Bolt'} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`nftItems.${index}.amount`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount</FormLabel>
                                            <FormControl>
                                                <Input placeholder={'100'} type="number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name={`nftItems.${index}.itemImage`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item Image</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'https://example.com/images/nft-image.png'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        {field.value && <ImagePreview src={field.value} />}
                                    </FormItem>
                                )}
                            />
                            {/* <Button type="button" variant="destructive" onClick={() => remove(index)}>
                                Remove Item
                            </Button> */}
                        </div>
                    ))}
                    {/* <Button variant={'secondary'} type="button" onClick={() => append({ itemName: '', amount: 0, itemImage: '' })}>
                        Add NFT Definition
                    </Button> */}
                </fieldset>
                <fieldset className="grid grid-cols-1 gap-4 rounded-lg border p-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                        Mint Requirements
                    </legend>
                    <div className="space-y-4">
                        <div className="flex space-x-2">
                            <FormField
                                control={form.control}
                                name={`energyRequired`}
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        <FormLabel>Energy Required to Mint</FormLabel>
                                        <FormControl>
                                            <Input placeholder={"1000"} type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`stxPerMint`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cost to Mint (STX)</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'0.1 STX'} type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`maxMintsPerTx`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Mints per Tx</FormLabel>
                                        <FormControl>
                                            <Input placeholder={'4'} type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                    {/* <Button variant={'secondary'} type="button" onClick={() => append({ itemName: '', amount: 0, itemImage: '' })}>
                        Add NFT Definition
                    </Button> */}
                </fieldset>
                {form.getValues && <PreviewQuestCard
                    metadata={{
                        name: form.getValues().collectionName,
                        description: {
                            type: "string",
                            description: form.getValues().description
                        },
                        attributes: [],
                        properties: {
                            collection: form.getValues().collectionName,
                            collection_image: form.getValues().collectionImage,
                            category: "image",
                            total_supply: form.getValues().nftItems[0].amount,
                            stx_mint_cost: form.getValues().stxPerMint,
                            energy_required: form.getValues().energyRequired,
                            max_mints_per_tx: form.getValues().maxMintsPerTx,
                            overview: form.getValues().overview,
                            utility: form.getValues().utility,
                            whitelisted: true
                        },
                        image: form.getValues().nftItems[0].itemImage
                    }}
                    contractAddress={`${stxAddress}.${form.getValues().collectionName}`}
                    stxAddress={stxAddress}
                />}
                <Button disabled={!form.formState.isValid} onClick={handleSubmitCollection} className="mt-4 w-full">Save Collection Metadata</Button>
                <div className='text-xs text-muted-foreground text-center'>You can reload this collection after saving it by typing in the same Collection Name during a later session.</div>

            </form>
        </Form>
    )
}

const PreviewQuestCard = ({ metadata, contractAddress, stxAddress }: any) => {


    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={'secondary'} onClick={() => { }} className="mt-4 w-full">Show Preview</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl justify-center flex bg-transparent border-none">
                <QuestCard
                    nftCollectionMetadata={metadata}
                    contractAddress={contractAddress}
                    lands={[]}
                    stxAddress={stxAddress}
                />
            </DialogContent>
        </Dialog>
    )
}