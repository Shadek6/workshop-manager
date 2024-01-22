import "dotenv/config";
import { Client, GatewayIntentBits, Guild } from "discord.js";
import { ChatInteractions } from "./config/ChatInteractions";
import { ButtonInteractions } from "./config/ButtonInteractions";

const client = new Client({ intents: [GatewayIntentBits.GuildMembers, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

client.on("ready", () => {
    console.log("Ready!");
    client.user?.setActivity("🔧 Zarządzanie warsztatami...", { type: 4 });
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isButton()) return ButtonInteractions(interaction);
    if (interaction.isChatInputCommand()) return ChatInteractions(interaction);
});

client.login(process.env.TOKEN);

export { client };
