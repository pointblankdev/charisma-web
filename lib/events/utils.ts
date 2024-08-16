import { getMob, incrementRewardLeaderboard, setMob } from "@lib/db-providers/kv";

export const handleContractEvent = async (event: any, embed: any) => {

    let symbol;
    if (event?.data?.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.lands") {
        symbol = '⛰'
    } else if (event?.data?.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.creatures-kit") {
        symbol = '🧑‍🌾'
    } else if (event?.data?.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.hogger-v0") {
        symbol = '🐗'
    } else if (event?.data?.contract_identifier === "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.wanted-hogger-v1") {
        symbol = '📜'
    } else if (event.type === 'FTBurnEvent') {
        symbol = '🔥'
    } else if (event.type === 'FTMintEvent') {
        symbol = '💰'
    } else {
        symbol = '❓'
    }

    try {

        if (event?.data?.value?.type === 'tap-energy') {
            embed.addField(`${symbol} ${event.type}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
        }

        // reset-complete: cache data for new hogger repawn
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

        // attack-result: cache data for hogger health
        else if (event?.data?.value?.event === 'attack-result') {
            const newHealth = Number(event.data.value['new-hogger-health'])
            const hogger = await getMob('hogger')
            hogger.health = newHealth
            await setMob('hogger', hogger)
            embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
        }

        // damage-result: cache data for hogger health
        else if (event?.data?.value?.event === 'damage-result') {
            embed.addField(`${symbol} ${event?.data?.value?.event}`, JSON.stringify(event.data.value).slice(0, 300) || "?");
        }

        // burn event
        else if (event.type === 'FTBurnEvent') {
            embed.addField(`${symbol} ${event.type}`, `Burned ${event.data.amount / Math.pow(10, 6)} ${event.data.asset_identifier.split('.')[1].split('::')[0]} tokens.`);
        }

        // mint event
        else if (event.type === 'FTMintEvent') {
            await incrementRewardLeaderboard(event.data.asset_identifier, event.data.amount, event.data.player);
            embed.addField(`${symbol} ${event.type}`, `Gained ${event.data.amount / Math.pow(10, 6)} ${event.data.asset_identifier.split('.')[1].split('::')[0]} points.`);
        }

        // unknown event
        else {
            console.error('Unknown event:', event.data)
            embed.addField(`${symbol} ${event.type}`, JSON.stringify(event.data).slice(0, 300) || "?");
        }

    } catch (error) {
        console.error('handlePrintEvent error:', error)
        console.log(event.data)
    }
}