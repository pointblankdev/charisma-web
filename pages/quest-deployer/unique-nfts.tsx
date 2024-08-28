import React, { useEffect, useRef, useState } from 'react';
import { Button } from "@components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form"
import { Input } from "@components/ui/input"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAccount } from "@micro-stacks/react"
import { setNftCollectionMetadata, getNftCollectionMetadata, setNftItemMetadata } from "@lib/user-api"
import Image from 'next/image'
import { isEmpty, uniq } from 'lodash';
import { Textarea } from '@components/ui/textarea';
import { Dialog, DialogContent, DialogTrigger } from '@components/ui/dialog';
import QuestCard from '@components/quest/quest-card';
import { Checkbox } from '@components/ui/checkbox';
import { UploadCloud } from 'lucide-react';
import { setNftMetadata } from '@lib/db-providers/kv';

const nftItemSchema = z.object({
    itemName: z.string().min(1, "Item name is required"),
    amount: z.coerce.number().min(1, "Amount must be at least 1"),
    itemImage: z.string().url("Must be a valid URL"),
})

const proposalFormSchema = z.object({
    collectionName: z.string().min(1, "Collection name is required"),
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
    allowMultipleClaims: z.boolean(),
})

type ProposalFormValues = z.infer<typeof proposalFormSchema>

const generateTemplate = ({ contractAddress, totalSupply, stxAddress, description, energyRequired, nftName, stxPerMint, maxMintsPerTx, allowMultipleClaims }: ProposalFormValues) => {
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
${allowMultipleClaims ? '' : `(define-constant ERR_ALREADY_CLAIMED (err u500))`}

(define-data-var base-uri (string-ascii 200) "https://charisma.rocks/api/v0/nfts/${contractAddress}/{id}.json")

${allowMultipleClaims ? '' : `;; Map to track which addresses have already claimed
(define-map claimed principal bool)`}

;; Whitelisted contract addresses
(define-map whitelisted-edks principal bool)

;; New map to keep track of NFT balances
(define-map token-balances principal uint)

;; New variable to store unused energy
(define-map stored-energy principal uint)

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

(define-public (burn (id uint))
  	(begin 
    	(asserts! (is-owner id tx-sender) ERR_NOT_TOKEN_OWNER)
    	(nft-burn? ${nftName} id tx-sender)
	)
)

;; New function to get the balance of NFTs for a principal
(define-read-only (get-balance (account principal))
  (ok (default-to u0 (map-get? token-balances account)))
)

;; SIP-009 function: Transfer NFT token to another owner.
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
    (match (nft-transfer? ${nftName} token-id sender recipient)
      success
        (begin
          (map-set token-balances sender (- (default-to u0 (map-get? token-balances sender)) u1))
          (map-set token-balances recipient (+ (default-to u0 (map-get? token-balances recipient)) u1))
          (ok success)
        )
      error (err error)
    )
  )
)

;; Mint a new NFT.
(define-private (mint (recipient principal))
  ;; Create the new token ID by incrementing the last minted ID.
  (let ((token-id (+ (var-get last-token-id) u1)))
    ;; Ensure the collection stays within the limit.
    (asserts! (< (var-get last-token-id) COLLECTION_LIMIT) ERR_SOLD_OUT)
    ${allowMultipleClaims ? '' : `
    ;; Check if the recipient has already claimed
    (asserts! (is-none (map-get? claimed recipient)) ERR_ALREADY_CLAIMED)
    ;; Mark the recipient as having claimed
    (map-set claimed recipient true)
    `}
    ;; Mint the NFT and send it to the given recipient.
    (try! (nft-mint? ${nftName} token-id recipient))
    ;; 1 STX cost send to dungeon-master
    (try! (stx-transfer? STX_PER_MINT tx-sender 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master))
    ;; Mint 1 governance token to the OWNER
    (try! (contract-call? 'SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token dmg-mint CHA_AMOUNT OWNER))
    ;; Update the last minted token ID.
    (var-set last-token-id token-id)
    ;; Update the balance for the recipient
    (map-set token-balances recipient (+ (default-to u0 (map-get? token-balances recipient)) u1))
    ;; Return the newly minted NFT ID.
    (ok token-id)
  )
)

${generateMintMultipleFunction(maxMintsPerTx)}

;; edk traits
(define-public (tap (land-id uint) (edk-contract <edk-trait>) (energy-out-max (optional uint)))
    (let
        (
            (tapped-out (unwrap-panic (contract-call? edk-contract tap land-id)))
            (user-stored-energy (default-to u0 (map-get? stored-energy tx-sender)))
            (total-energy (+ (get energy tapped-out) user-stored-energy))
            (energy-to-use (match energy-out-max
                            e (min total-energy e)
                            total-energy))
            (nfts-to-mint (min (/ energy-to-use ENERGY_PER_NFT) MAX_NFTS_PER_TX))
            (energy-used (* nfts-to-mint ENERGY_PER_NFT))
            (remaining-energy (- total-energy energy-used))
        )
        (asserts! (is-whitelisted-edk (contract-of edk-contract)) ERR_INVALID_EDK)
        (map-set stored-energy tx-sender remaining-energy)
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

export default function UniqueNftTemplate({ form: parentForm, onFormChange }: any) {
    const { stxAddress } = useAccount()


    const form = useForm<ProposalFormValues>({
        resolver: zodResolver(proposalFormSchema),
        defaultValues: {
            collectionName: '',
            maxMintsPerTx: 4,
            allowMultipleClaims: true,
        },
        mode: "onChange",
    })

    const handleChange = () => {
        const totalSupply = parsedData.length
        const collectionName = form.getValues().collectionName
        const safeName = collectionName.toLowerCase().replace(/[^a-zA-Z0-9\- ]/g, "").replace(/\s+/g, "-")
        const contractAddress = `${stxAddress}.${safeName}`
        parentForm.setValue('name', collectionName)

        const template = generateTemplate({ ...form.getValues(), contractAddress, totalSupply, stxAddress: stxAddress!, nftName: safeName })
        onFormChange(template)
    }

    const handleSubmitCollection = async (e: React.MouseEvent) => {
        e.preventDefault()
        const totalSupply = parsedData.length
        const { collectionName, collectionImage, description, stxPerMint, energyRequired, maxMintsPerTx, overview, utility, allowMultipleClaims } = form.getValues();
        const safeName = collectionName.toLowerCase().replace(/[^a-zA-Z0-9\- ]/g, "").replace(/\s+/g, "-")
        const contractAddress = `${stxAddress}.${safeName}`

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
                stx_mint_cost: stxPerMint,
                energy_required: energyRequired,
                max_mints_per_tx: maxMintsPerTx,
                overview: overview,
                utility: utility,
                allow_multiple_claims: allowMultipleClaims,
                whitelisted: false,
                contract_name: contractAddress,
                proposal_name: `${contractAddress}-proposal`
            }
        }

        for (const item of parsedData) {
            try {
                await setNftItemMetadata(contractAddress, item.edition, { ...item, id: item.edition })
                console.log(item.name)
            } catch (error) {
                console.error("Error submitting collection:", error)
                // Here you might want to show an error message to the user
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





    // file upload logic

    const [parsedData, setParsedData] = useState<any>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
    }, [parsedData, onFormChange]);

    const handleFileUpload = (file: File) => {
        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            const content = e.target?.result as string;

            if (file.type === 'application/json') {
                const jsonCollectionData = JSON.parse(content)
                setParsedData(jsonCollectionData)

            } else {
                console.error('Invalid file type');
            }
        };

        reader.readAsText(file);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFileUpload(files[0]);
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

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

                <fieldset className="grid grid-cols-1 gap-0 rounded-lg border px-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                        NFT Definitions
                    </legend>

                    <div
                        className={`w-full h-48 rounded-lg flex items-center justify-center cursor-pointer ${isDragging ? 'bg-primary/10 animate-pulse' : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={handleButtonClick}
                    >
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleFileInputChange}
                            className="hidden"
                            ref={fileInputRef}
                        />
                        <div className="text-center">
                            <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-1 text-sm text-secondary/80">
                                {isDragging ? 'Drop the file here' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="mt-1 text-xs text-secondary/50">.json files only</p>
                        </div>
                    </div>
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
                                name={`allowMultipleClaims`}
                                render={({ field }) => (
                                    <FormItem className='flex flex-col w-32 justify-around items-center'>
                                        <FormLabel>Allow Multiple Claims per Wallet</FormLabel>
                                        <FormControl>
                                            <Checkbox className='w-8 h-8' checked={field.value} onCheckedChange={(checked: boolean) => { form.setValue('allowMultipleClaims', checked); !checked && form.setValue('maxMintsPerTx', 1) }} />
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
                                            <Input disabled={!form.getValues().allowMultipleClaims} placeholder={'4'} type="number" {...field} />
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
                        image: form.getValues().collectionName,
                        attributes: [],
                        properties: {
                            collection: form.getValues().collectionName,
                            collection_image: form.getValues().collectionImage,
                            category: "image",
                            total_supply: parsedData.length,
                            stx_mint_cost: form.getValues().stxPerMint,
                            energy_required: form.getValues().energyRequired,
                            max_mints_per_tx: form.getValues().maxMintsPerTx,
                            overview: form.getValues().overview,
                            utility: form.getValues().utility,
                            allow_multiple_claims: form.getValues().allowMultipleClaims,
                            whitelisted: true
                        },
                    }}
                    contractAddress={`${stxAddress}.${form.getValues().collectionName}`}
                    stxAddress={stxAddress}
                />}
                <Button disabled={!isEmpty(form.formState.errors)} onClick={handleSubmitCollection} className="mt-4 w-full">Save Collection Metadata</Button>
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
                    stxAddress={''}
                />
            </DialogContent>
        </Dialog>
    )
}