import { EmbedBuilder, Webhook } from "@tycrek/discord-hookr";

const errorLogsWebhook = new Webhook('https://discord.com/api/webhooks/1277587840779292692/5plnSplDINC7K0groBz5-JfMFLGLer_nF18jlPkcqCu3_bqBu2zU15kP78BrFvJw1t8p');

const Logger = {
    error: async (message: any) => {
        console.error(message);
        const embed = new EmbedBuilder()
        embed.setDescription(JSON.stringify(message))
        errorLogsWebhook.addEmbed(embed.getEmbed());
        await errorLogsWebhook.send()
    }
};

export default Logger;