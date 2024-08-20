import { getMob, hadLandBefore, incrementRewardLeaderboard, setHadLandBefore, setLandsBalance, setMob } from "@lib/db-providers/kv";
import { Webhook, EmbedBuilder } from '@tycrek/discord-hookr';

const generalChatHook = new Webhook('https://discord.com/api/webhooks/1274508457759866952/qYd6kfj7Zc_AKtUIH08Z-ejfj5B4FlUrbirkZoXm0TOgNa_YjEksotxIU7nMBPKm_b7G');


// const experienceAmount = await getTokenBalance('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience', tx.metadata.sender)
// const experienceSupply = await getTotalSupply('SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience')

// // update leaderboard
// await updateExperienceLeaderboard(experienceAmount, tx.metadata.sender)
// .setTitle('Experience Gained')
// .setDescription(`A player has gained experience`)
// .setThumbnail({ url: 'https://charisma.rocks/experience.png' })
// .addField({ name: 'Total Experience', value: Math.round(experienceAmount / Math.pow(10, 6)).toString() + ' EXP', inline: true })
// .addField({ name: '% of Total Supply', value: numeral(experienceAmount / experienceSupply).format('0.0%'), inline: true })
// .addField({ name: 'Wallet Address', value: tx.metadata.sender })

export const handleContractEvent = async (event: any, builder: any) => {

    let symbol = '❓';

    try {

        if (event.type === 'FTBurnEvent') {
            symbol = '🔻'

            builder.addField({
                name: `${symbol} ${event.type}`,
                value: `Burned ${event.data.amount / Math.pow(10, 6)} ${event.data.asset_identifier.split('.')[1].split('::')[0]} tokens.`
            });
        }

        else if (event.type === 'NFTBurnEvent') {
            symbol = '🔻'

            builder.addField({
                name: `${symbol} ${event.type}`,
                value: JSON.stringify(event.data).slice(0, 300) + "."
            });
        }

        else if (event.type === 'FTMintEvent') {
            symbol = '🔺'

            builder.addField({
                name: `${symbol} ${event.type}`,
                value: `Gained ${event.data.amount / Math.pow(10, 6)} ${event.data.asset_identifier.split('.')[1].split('::')[0]} tokens.`
            });
        }

        else if (event.type === 'NFTMintEvent') {
            symbol = '🔺'

            builder.addField({
                name: `${symbol} ${event.type}`,
                value: JSON.stringify(event.data).slice(0, 300) + "."
            });
        }

        else if (event.type === 'FTTransferEvent') {
            symbol = '➡️'

            builder.addField({
                name: `${symbol} ${event.type}`,
                value: JSON.stringify(event.data).slice(0, 300) + "."
            });
        }

        else if (event.type === 'NFTTransferEvent') {
            symbol = '➡️'

            builder.addField({
                name: `${symbol} ${event.type}`,
                value: JSON.stringify(event.data).slice(0, 300) + "."
            });
        }

        else if (event.type === 'SmartContractEvent') {

            if (event.data.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2") {
                symbol = '📜'

                if (event.data.value.event === 'distributing-rewards') {
                    builder.addField({
                        name: `${symbol} ${event.data.value.event}`,
                        value: JSON.stringify(event.data.value).slice(0, 300) + '.'
                    });
                }

                else if (event.data.value.event === 'rewards-distributed') {
                    await incrementRewardLeaderboard('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma', event.data.value['cha-amount'], event.data.value.player);
                    builder.addField({
                        name: `${symbol} ${event.data.value.event}`,
                        value: JSON.stringify(event.data.value).slice(0, 300) + '.'
                    });
                }

                else if (event.data.value.event === 'attack-hogger') {
                    builder.addField({
                        name: `${symbol} ${event.data.value.event}`,
                        value: JSON.stringify(event.data.value).slice(0, 300) + '.'
                    });
                }

                else if (event.data.value.event === 'new-epoch-started') {
                    builder.addField({
                        name: `${symbol} ${event.data.value.event}`,
                        value: JSON.stringify(event.data.value).slice(0, 300) + '.'
                    });
                }

                else if (event.data.value.event === 'attack-result') {
                    const newHealth = Number(event.data.value['new-hogger-health'])
                    const hogger = await getMob('hogger')
                    hogger.health = newHealth
                    await setMob('hogger', hogger)
                    builder.addField({
                        name: `${symbol} ${event.data.value.event}`,
                        value: JSON.stringify(event.data.value).slice(0, 300) + '.'
                    });
                }

                else {
                    console.error('Unknown wanted-hogger-v2 event:', event.data)
                    builder.addField({
                        name: `${symbol} ${event.type}`,
                        value: JSON.stringify(event.data).slice(0, 300) + '.'
                    });
                }
            }

            else if (event.data.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hogger-v0") {
                symbol = '🐗'

                if (event.data.value.event === 'take-damage') {
                    const newHealth = Number(event.data.value['current-health'])
                    const hogger = await getMob('hogger')
                    hogger.health = newHealth
                    await setMob('hogger', hogger)
                    builder.addField({
                        name: `${symbol} ${event.data.value.event}`,
                        value: JSON.stringify(event.data.value).slice(0, 300) || "?"
                    });
                }

                else if (event.data.value.event === 'damage-result') {
                    const newHealth = Number(event.data.value['new-health'])
                    const hogger = await getMob('hogger')
                    hogger.health = newHealth
                    await setMob('hogger', hogger)
                    builder.addField({
                        name: `${symbol} ${event.data.value.event}`,
                        value: JSON.stringify(event.data.value).slice(0, 300) || "?"
                    });
                }

                else if (event.data.value.event === 'attack-result') {
                    const newHealth = Number(event.data.value['new-hogger-health'])
                    const hogger = await getMob('hogger')
                    hogger.health = newHealth
                    await setMob('hogger', hogger)
                    builder.addField({
                        name: `${symbol} ${event.data.value.event}`,
                        value: JSON.stringify(event.data.value).slice(0, 300) || "?"
                    });
                }

                else if (event.data.value.event === 'reset-for-new-epoch') {
                    builder.addField({
                        name: `${symbol} ${event.data.value.event}`,
                        value: JSON.stringify(event.data.value).slice(0, 300) || "?"
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
                        value: JSON.stringify(event.data.value).slice(0, 300) || "?"
                    });

                    try {
                        // hogger respawn alert for general chat
                        const hoggerRespawnedAlert = new EmbedBuilder()
                            .setTitle('Hogger has respawned!')
                            .addField({ name: 'Level', value: String(newLevel), inline: true })
                            .addField({ name: 'Max Health', value: String(newMaxHp), inline: true })
                            .addField({ name: 'Regen Rate', value: String(newRegen), inline: true })
                            .setDescription(`If defeated, everyone who contributes to the battle receives a share of the rewards. Experience is divided up evenly, and CHA tokens are split based on damage dealt to Hogger.`)
                            .setThumbnail({ url: 'https://beta.charisma.rocks/quests/wanted-hogger/hogger-icon.png' })
                            .setUrl('http://beta.charisma.rocks/quests/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2?view=mob')

                        generalChatHook.addEmbed(hoggerRespawnedAlert.getEmbed());
                        await generalChatHook.send()
                        // builder
                        //     .setTitle('Hogger has respawned!')
                        //     .addField({ name: 'Level', value: String(newLevel), inline: true })
                        //     .addField({ name: 'Max Health', value: String(newMaxHp), inline: true })
                        //     .addField({ name: 'Regen Rate', value: String(newRegen), inline: true })
                        //     .setDescription(`If defeated, everyone who contributes to the battle receives a share of the rewards. Experience is divided up evenly, and CHA tokens are split based on damage dealt to Hogger.`)
                        //     .setThumbnail({ url: 'https://beta.charisma.rocks/quests/wanted-hogger/hogger-icon.png' })
                        //     .setUrl('http://beta.charisma.rocks/quests/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v2?view=mob')
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
                        value: JSON.stringify(event.data.value).slice(0, 300) || "?"
                    });
                }

                else if (event.data.value.type === 'store-energy') {

                    builder.addField({
                        name: `${symbol} ${event.data.value.type}`,
                        value: JSON.stringify(event.data.value).slice(0, 300) || "?"
                    });
                }

                else if (event.data.value.type === 'sft_mint') {
                    const landId = Number(event.data.value['token-id'])
                    const recipient = event.data.value['recipient']
                    await setLandsBalance(landId, recipient)
                    await setHadLandBefore(landId, recipient)
                    builder.addField({
                        name: `${symbol} ${event.data.value.type}`,
                        value: JSON.stringify(event.data.value).slice(0, 300) || "?"
                    });
                }

                else {

                    console.error('Unknown lands event:', event.data)
                    builder.addField({
                        name: `${symbol} ${event.type}`,
                        value: JSON.stringify(event.data).slice(0, 300) || "?"
                    });
                }
            }

            else if (event.data.contract_identifier === "SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.univ2-core") {
                symbol = '💱'

                console.error('Unknown velar swap event:', event.data)
                builder.addField({
                    name: `${symbol} ${event.type}`,
                    value: JSON.stringify(event.data).slice(0, 1200) || "?"
                });

            }


            else if (event.data.contract_identifier === "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme002-proposal-submission") {
                symbol = '⚖️'

                console.error('Unknown governance proposal event:', event.data)
                builder.addField({
                    name: `${symbol} ${event.type}`,
                    value: JSON.stringify(event.data).slice(0, 300) || "?"
                });
            }

            else if (event.data.contract_identifier === "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme001-proposal-voting") {
                symbol = '⚖️'

                console.error('Unknown governance proposal event:', event.data)
                builder.addField({
                    name: `${symbol} ${event.type}`,
                    value: JSON.stringify(event.data).slice(0, 300) || "?"
                });
            }

            else {

                console.error('Unknown contract identifier:', event.data)
                builder.addField({
                    name: `${symbol} ${event.type}`,
                    value: JSON.stringify(event.data).slice(0, 300) || "?"
                });
            }

        }

        else {

            console.error('Unknown event type:', event.data)
            builder.addField({
                name: `${symbol} ${event.type}`,
                value: JSON.stringify(event.data).slice(0, 300) + "."
            });
        }

        return builder

    } catch (error) {
        console.error('handlePrintEvent error:', error)
        console.log(event.data)
    }
}