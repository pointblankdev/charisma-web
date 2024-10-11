import { addCachedProposal, addPlayer, getMob, getNftCollectionMetadata, getVoteData, incrementRewardLeaderboard, isPlayer, saveSwapEvent, setHadLandBefore, setLandsBalance, setMob, setNftCollectionMetadata, setPlayerPill, setPlayerTokens, setVoteData, trackBurnEvent, updateExperienceLeaderboard } from "@lib/db-providers/kv";
import { getTokenBalance } from "@lib/stacks-api";
import { Webhook, EmbedBuilder } from '@tycrek/discord-hookr';
import Logger from "@lib/logger";

const generalChatHook = new Webhook('https://discord.com/api/webhooks/1274508457759866952/qYd6kfj7Zc_AKtUIH08Z-ejfj5B4FlUrbirkZoXm0TOgNa_YjEksotxIU7nMBPKm_b7G');

const trackedContracts = [
    "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token",
    "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience",
    "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token",
    "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-welsh",
    "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-roo",
    "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.synthetic-stx",
]

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

        const contractId = event.data.asset_identifier.split('::')[0]
        if (trackedContracts.includes(contractId)) {
            // get the user's token balance
            const balance = await getTokenBalance(contractId, event.data.recipient)
            // save the balance in kv storage
            await addPlayer(event.data.recipient)
            await setPlayerTokens(contractId, event.data.recipient, balance)
        }

        builder.addField({
            name: `${symbol} ${event.type}`,
            value: JSON.stringify(event.data).slice(0, 300)
        });
    }

    else if (event.type === 'FTMintEvent') {
        symbol = '🔺'

        const contractId = event.data.asset_identifier.split('::')[0]
        if (trackedContracts.includes(contractId)) {
            // get the user's token balance
            const balance = await getTokenBalance(contractId, event.data.recipient)
            // save the balance in kv storage
            await addPlayer(event.data.recipient)
            await setPlayerTokens(contractId, event.data.recipient, balance)
        }

        else {

            builder.addField({
                name: `${symbol} ${event.type}`,
                value: JSON.stringify(event.data).slice(0, 300)
            });
        }
    }

    else if (event.type === 'FTBurnEvent') {
        symbol = '🔻'

        const contractId = event.data.asset_identifier.split('::')[0]
        if (trackedContracts.includes(contractId)) {
            // get the user's token balance
            const balance = await getTokenBalance(contractId, event.data.sender)
            // save the balance in kv storage
            await addPlayer(event.data.sender)
            await setPlayerTokens(contractId, event.data.sender, balance)
        }

        if (trackedContracts.includes(contractId)) {
            symbol = '🔥'

            // track redemptions burned, timestamp, and by whom
            await trackBurnEvent(event.data)

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

        if (event.data.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2") {
            symbol = '🐗'

            if (event.data.value.event === 'distributing-rewards') {
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else if (event.data.value.event === 'rewards-distributed') {
                // await incrementRewardLeaderboard('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma', event.data.value['cha-amount'], event.data.value.player);
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else if (event.data.value.event === 'attack-hogger') {
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else if (event.data.value.event === 'new-epoch-started') {
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else if (event.data.value.event === 'attack-result') {
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else {
                console.error('Unknown wanted-hogger-v2 event:', event.data)
                builder.addField({
                    name: `${symbol} ${event.type}`,
                    value: JSON.stringify(event.data).slice(0, 300)
                });
            }
        }

        else if (event.data.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hogger-v0") {
            symbol = '🐗'

            if (event.data.value.event === 'take-damage') {
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else if (event.data.value.event === 'damage-result') {
                const newHealth = Number(event.data.value['new-health'])
                const hogger = await getMob('hogger')
                hogger.health = newHealth
                await setMob('hogger', hogger)
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else if (event.data.value.event === 'attack-result') {
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else if (event.data.value.event === 'reset-for-new-epoch') {
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else if (event.data.value.event === 'reset-complete') {
                const newLevel = Number(event.data.value['new-epoch'])
                const newMaxHp = Number(event.data.value['new-max-health'])
                const newRegen = Number(event.data.value['new-regen-rate'])
                const hogger = await getMob('hogger')
                hogger.level = newLevel
                hogger.health = newMaxHp
                hogger.maxHealth = newMaxHp
                hogger.regenRate = newRegen
                await setMob('hogger', hogger)
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });

                try {
                    // hogger respawn alert for general chat
                    const hoggerRespawnedAlert = new EmbedBuilder()
                        .setTitle('Hogger has respawned!')
                        .addField({ name: 'Level', value: String(newLevel), inline: true })
                        .addField({ name: 'Max Health', value: String(newMaxHp), inline: true })
                        .addField({ name: 'Regen Rate', value: String(newRegen), inline: true })
                        .setDescription(`If defeated, everyone who contributes to the battle receives a share of the rewards. Experience is divided up evenly, and CHA tokens are split based on damage dealt to Hogger.`)
                        .setThumbnail({ url: 'https://charisma.rocks/quests/wanted-hogger/hogger-icon.png' })
                        .setUrl('http://charisma.rocks/quests/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2?view=mob')

                    // generalChatHook.addEmbed(hoggerRespawnedAlert.getEmbed());
                    // await generalChatHook.send()
                } catch (error) {
                    console.error('generalChatHook error:', error)
                }
            }
        }

        else if (event.data.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands") {
            symbol = '⛰'

            if (event.data.value.type === 'tap-energy') {

                builder.addField({
                    name: `${symbol} ${event.data.value.type}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else if (event.data.value.type === 'store-energy') {

                builder.addField({
                    name: `${symbol} ${event.data.value.type}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else if (event.data.value.type === 'sft_mint') {
                const landId = Number(event.data.value['token-id'])
                const recipient = event.data.value['recipient']
                await setLandsBalance(landId, recipient)
                await setHadLandBefore(landId, recipient)
                const existingPlayer = await isPlayer(recipient)
                if (!existingPlayer) await addPlayer(recipient)
                builder.addField({
                    name: `${symbol} ${event.data.value.type}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else {

                console.error('Unknown lands event:', event.data)
                builder.addField({
                    name: `${symbol} ${event.type}`,
                    value: JSON.stringify(event.data).slice(0, 300)
                });
            }
        }

        else if (event.data.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.univ2-core") {
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

        else if (event.data.contract_identifier === "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme002-proposal-submission") {
            symbol = '⚖️'

            Logger.debug({ 'Unknown governance proposal event': event.data })
            builder.addField({
                name: `${symbol} ${event.type}`,
                value: JSON.stringify(event.data).slice(0, 300)
            });
        }

        else if (event.data.contract_identifier === "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting") {
            symbol = '⚖️'

            if (event.data.value.event === 'vote') {
                // increment proposal-user votes data structure in vercel kv storage
                const voteData = await getVoteData(event.data.value.proposal, event.data.value.voter);
                // {for: 0, against: 0}
                if (event.data.value.for) {
                    voteData.for += event.data.value.amount;
                } else {
                    voteData.against += event.data.value.amount;
                }
                await setVoteData(event.data.value.proposal, event.data.value.voter, voteData);
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            } else if (event.data.value.event === 'propose') {
                // increment proposal list data structure in vercel kv storage
                await addCachedProposal(event.data.value.proposal);
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            } else {

                Logger.debug({ 'Unknown governance proposal event': event.data })
                builder.addField({
                    name: `${symbol} ${event.type}`,
                    value: JSON.stringify(event.data).slice(0, 300)
                });
            }
        }

        else if (event.data.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.spell-scrolls-fire-bolt") {
            symbol = '📜'

            Logger.debug({ 'Unknown spell scroll event': event.data })
            builder.addField({
                name: `${symbol} ${event.type}`,
                value: JSON.stringify(event.data).slice(0, 300)
            });
        }

        else if (event.data.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.apple-farm-v2") {
            symbol = '🍎'


            if (event.data.value.event === 'harvest-apple-farm') {
                builder.addField({
                    name: `${symbol} ${event.data.value.event}`,
                    value: JSON.stringify(event.data.value).slice(0, 300)
                });
            }

            else {
                Logger.debug({ 'Unknown apple farm event': event.data })
                builder.addField({
                    name: `${symbol} ${event.type}`,
                    value: JSON.stringify(event.data).slice(0, 300)
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