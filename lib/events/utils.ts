import { getMob, incrementRewardLeaderboard, setMob } from "@lib/db-providers/kv";

export const handleContractEvent = async (event: any, embed: any) => {

    let symbol = '❓';

    try {

        // // burn event
        // if (event.type === 'FTBurnEvent') {
        //     symbol = '🔥'
        //     embed.addField(`${symbol} ${event.type}`, `Burned ${event.data.amount / Math.pow(10, 6)} ${event.data.asset_identifier.split('.')[1].split('::')[0]} tokens.`);
        // }

        // // mint event
        // else if (event.type === 'FTMintEvent') {
        //     symbol = '💰'
        //     embed.addField(`${symbol} ${event.type}`, `Gained ${event.data.amount / Math.pow(10, 6)} ${event.data.asset_identifier.split('.')[1].split('::')[0]} points.`);
        // }


        if (event?.data?.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v1") {
            symbol = '📜'

            if (event?.data?.value?.event === 'rewards-distributed') {
                await incrementRewardLeaderboard('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma', event.data.value['cha-amount'], event.data.value.event.player);
                embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
            }

            else if (event?.data?.value?.event === 'attack-hogger') {
                embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
            }

            else if (event?.data?.value?.event === 'result-epoch') {
                embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
            }
        }

        else if (event?.data?.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hogger-v0") {
            symbol = '🐗'

            if (event?.data?.value?.event === 'take-damage') {
                embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
            }

            else if (event?.data?.value?.event === 'damage-result') {
                embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
            }

            else if (event?.data?.value?.event === 'attack-result') {
                const newHealth = Number(event.data.value['new-hogger-health'])
                const hogger = await getMob('hogger')
                hogger.health = newHealth
                await setMob('hogger', hogger)
                embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
            }

            else if (event?.data?.value?.event === 'reset-for-new-epoch') {
                embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
            }

            else if (event?.data?.value?.event === 'reset-complete') {
                const newLevel = Number(event.data.value['new-epoch'])
                const newMaxHp = Number(event.data.value['new-max-health'])
                const newRegen = Number(event.data.value['new-regen-rate'])
                const hogger = await getMob('hogger')
                hogger.level = newLevel
                hogger.maxHealth = newMaxHp
                hogger.regenRate = newRegen
                await setMob('hogger', hogger)
                embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
            }
        }

        else if (event?.data?.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands") {
            symbol = '⛰'

            if (event?.data?.value?.type === 'tap-energy') {

                embed.addField(`${symbol} ${event?.data?.value?.type}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
            } else {

                console.error('Unknown lands event:', event.data)
                embed.addField(`${symbol} ${event.type}`, JSON.stringify(event.data).slice(0, 300) || "?");
            }
        }

        else if (event?.data?.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.experience") {
            symbol = '✨'

            console.error('Unknown experience event:', event.data)
            embed.addField(`${symbol} ${event.type}`, JSON.stringify(event.data).slice(0, 300) || "?");
        }

        else if (event?.data?.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.liquid-staked-charisma") {
            symbol = '🔴'

            console.error('Unknown staked charisma token event:', event.data)
            embed.addField(`${symbol} ${event.type}`, JSON.stringify(event.data).slice(0, 300) || "?");
        }

        else if (event?.data?.contract_identifier === "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token") {
            symbol = '🔴'

            console.error('Unknown charisma token event:', event.data)
            embed.addField(`${symbol} ${event.type}`, JSON.stringify(event.data).slice(0, 300) || "?");
        }

        else if (event.data.asset_identifier === "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dme000-governance-token::charisma") {

        }

        else {

            console.error('Unknown event:', event.data)
            embed.addField(`${symbol} ${event.type}`, JSON.stringify(event.data).slice(0, 300) || "?");
        }

    } catch (error) {
        console.error('handlePrintEvent error:', error)
        console.log(event.data)
    }
}