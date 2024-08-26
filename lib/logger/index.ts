import { EmbedBuilder, Webhook } from "@tycrek/discord-hookr";

const errorLogsWebhook = new Webhook('https://discord.com/api/webhooks/1277587840779292692/5plnSplDINC7K0groBz5-JfMFLGLer_nF18jlPkcqCu3_bqBu2zU15kP78BrFvJw1t8p');
const oracleLogsWebhook = new Webhook('https://discord.com/api/webhooks/1277601928511098901/TxZ5WphT-nON7tJq5YqcUO9f5pIAKVLcsnAGFjVF8ZzGWTslr8gi0OzmzUXAgaNKcprQ');

const Logger = {
    error: async (message: any) => {
        console.error(message);
        try {
            const embed = new EmbedBuilder()
            embed.setDescription(JSON.stringify(message))
            errorLogsWebhook.addEmbed(embed.getEmbed());
            await errorLogsWebhook.send()
        } catch (error) {
            console.error('Error log failure to Discord');
        }
    },
    oracle: async (message: any) => {
        console.log(message);
        try {
            const embed = new EmbedBuilder()
            embed.setDescription(JSON.stringify(message))
            oracleLogsWebhook.addEmbed(embed.getEmbed());
            await oracleLogsWebhook.send()
        } catch (error) {
            console.error('Oracle log failure to Discord');
        }
    }
};

export default Logger;