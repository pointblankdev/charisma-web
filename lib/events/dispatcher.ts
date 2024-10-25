import { addCachedProposal, addPlayer, getMob, getVoteData, isPlayer, saveSwapEvent, saveTapEvent, setHadLandBefore, setLandsBalance, setMob, setNftCollectionMetadata, setPlayerPill, setPlayerTokens, setVoteData, trackBurnEvent, trackMintEvent, trackTransferEvent, updateExperienceLeaderboard } from "@lib/db-providers/kv";
import { getTokenBalance } from "@lib/stacks-api";
import { EmbedBuilder } from '@tycrek/discord-hookr';
import Logger from "@lib/logger";

export const handleContractEvent = async (event: any, builder: any) => {

    let symbol = '❓';

    if (event.type === 'STXTransferEvent') {
        symbol = '🟠'

        builder.addField({
            name: `${symbol} ${event.type}`,
            value: JSON.stringify(event.data).slice(0, 300)
        });
    }

    else if (event.type === 'FTTransferEvent') {
        symbol = '➡️'

        // track transfer events, timestamp, and by whom
        await trackTransferEvent(event.data)

        const contractId = event.data.asset_identifier.split('::')[0]
        // get the user's token balance
        const balance = await getTokenBalance(contractId, event.data.recipient)
        // save the balance in kv storage
        await addPlayer(event.data.recipient)
        await setPlayerTokens(contractId, event.data.recipient, balance)

        builder.addField({
            name: `${symbol} ${event.type}`,
            value: JSON.stringify(event.data).slice(0, 300)
        });
    }

    else if (event.type === 'FTMintEvent') {
        symbol = '🔺'

        // track mint events, timestamp, and by whom
        await trackMintEvent(event.data)

        const contractId = event.data.asset_identifier.split('::')[0]
        // get the user's token balance
        const balance = await getTokenBalance(contractId, event.data.recipient)
        // save the balance in kv storage
        await addPlayer(event.data.recipient)
        await setPlayerTokens(contractId, event.data.recipient, balance)

        builder.addField({
            name: `${symbol} ${event.type}`,
            value: JSON.stringify(event.data).slice(0, 300)
        });
    }


    else if (event.type === 'FTBurnEvent') {
        symbol = '🔻'

        // track burn events, timestamp, and by whom
        await trackBurnEvent(event.data)

        const contractId = event.data.asset_identifier.split('::')[0]
        // get the user's token balance
        const balance = await getTokenBalance(contractId, event.data.sender)
        // save the balance in kv storage
        await addPlayer(event.data.sender)
        await setPlayerTokens(contractId, event.data.sender, balance)

        builder.addField({
            name: `${symbol} ${event.type}`,
            value: JSON.stringify(event.data).slice(0, 300)
        });
    }

    else if (event.type === 'NFTTransferEvent') {
        symbol = '➡️'

        builder.addField({
            name: `${symbol} ${event.type}`,
            value: JSON.stringify(event.data).slice(0, 300)
        });
    }

    else if (event.type === 'NFTMintEvent') {
        symbol = '🔺'

        const contractId = event.data.asset_class_identifier.split('::')[0]


        if (contractId === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.red-pill-nft" || contractId === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.blue-pill-nft") {
            symbol = '💊'

            console.log(symbol)
            console.log(event)

            const pill: any = {};
            if (contractId.split('.')[1] === 'red-pill-nft') {
                pill.color = 'RED'
                pill.url = 'https://charisma.rocks/sip9/pills/red-pill.gif'
            } else {
                pill.color = 'BLUE'
                pill.url = 'https://charisma.rocks/sip9/pills/blue-pill.gif'
            }
            await setPlayerPill(event.data.recipient, pill.color)

            builder.setThumbnail({ url: pill.url })
            builder.addField({
                name: `${symbol} ${event.type}`,
                value: JSON.stringify(event.data).slice(0, 300)
            });

        }

        else {

            builder.addField({
                name: `${symbol} ${event.type}`,
                value: JSON.stringify(event.data).slice(0, 300)
            });
        }
    }

    else if (event.type === 'NFTBurnEvent') {
        symbol = '🔻'

        builder.addField({
            name: `${symbol} ${event.type}`,
            value: JSON.stringify(event.data).slice(0, 300)
        });
    }

    else if (event.type === 'SmartContractEvent') {
        symbol = '🧾'

        if (event.data.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core") {
            symbol = '💱'

            if (event.data.value.op === 'swap') {

                builder.addField({
                    name: `${symbol} ${event.data.value.op}`,
                    value: JSON.stringify(event.data.value).slice(0, 1200)
                });

                try {
                    await saveSwapEvent(event.data.value)
                } catch (error) {
                    Logger.debug(event.data)
                }
            } else if (event.data.value.op === 'mint') {

                builder.addField({
                    name: `${symbol} ${event.data.value.op}`,
                    value: JSON.stringify(event.data.value).slice(0, 1200)
                });
            } else if (event.data.value.op === 'burn') {

                builder.addField({
                    name: `${symbol} ${event.data.value.op}`,
                    value: JSON.stringify(event.data.value).slice(0, 1200)
                });
            } else if (event.data.value.op === 'create') {

                builder.addField({
                    name: `${symbol} ${event.data.value.op}`,
                    value: JSON.stringify(event.data.value).slice(0, 1200)
                });
            } else {

                console.error('Unknown Charisma Swap Event:', event.data)
                builder.addField({
                    name: `${symbol} ${event.type}`,
                    value: JSON.stringify(event.data).slice(0, 1200)
                });
            }

        }

        else if (event.data.contract_identifier.includes("SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.meme-engine")) {
            symbol = '⚡'

            if (event.data.value.sender && event.data.value.energy && event.data.value.integral) {

                builder.addField({
                    name: `${symbol} tap engine`,
                    value: JSON.stringify(event.data.value).slice(0, 1200)
                });

                try {
                    await saveTapEvent(event.data.value)
                } catch (error) {
                    Logger.debug(event.data)
                }
            } else {

                console.error('Unknown Engine Event:', event.data)
                builder.addField({
                    name: `${symbol} ${event.type}`,
                    value: JSON.stringify(event.data).slice(0, 1200)
                });
            }

        }

        else {

            Logger.debug({ 'Unknown Contract Identifier Error': event.data })
            builder.addField({
                name: `${symbol} ${event.type}`,
                value: JSON.stringify(event.data).slice(0, 300)
            });
        }

    }

    else {

        Logger.debug({ 'Unknown Event Type Error': event.data })
        builder.addField({
            name: `${symbol} ${event.type}`,
            value: JSON.stringify(event.data).slice(0, 300)
        });
    }

    return builder
}