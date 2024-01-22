import { ChatInputCommandInteraction } from "discord.js";
import { Config } from "../class/Config";
import { Bonus } from "../class/Bonus";
import { Worker } from "../class/Worker";
import { Ticket } from "../class/Ticket";

export async function ChatInteractions(interaction: ChatInputCommandInteraction) {
    const config = new Config();
    
    if (!config.Exists(interaction.guildId!) && interaction.options.getSubcommand() !== "create") return;
    const bonus = new Bonus(interaction.guildId!);
    const worker = new Worker(interaction.guildId!);
    const ticket = new Ticket(interaction.guildId!)

    if (interaction.commandName === "config") {
        if (interaction.options.getSubcommand() === "create") {
            await config.Create(interaction);
        }
        if (interaction.options.getSubcommand() === "update") {
            await config.Update(interaction);
        }
        if (interaction.options.getSubcommand() === "add-worker-percentage") {
            await config.AddWorkerPercentage(interaction);
        }
        if (interaction.options.getSubcommand() === "clear-worker-percentage") {
            await config.ClearWorkerPercentage(interaction);
        }
        if (interaction.options.getSubcommand() === "refresh") {
            await config.Refresh(interaction);
        }
        if (interaction.options.getSubcommand() === "show") {
            await config.Show(interaction);
        }
    }

    if (interaction.commandName === "premia") {
        if (interaction.options.getSubcommand() === "add") {
            await bonus.Add(interaction);
        }
    }

    if (interaction.commandName === "worker") {
        if (interaction.options.getSubcommand() === "add") {
            await worker.Add(interaction)
        }
        if (interaction.options.getSubcommand() === "register") {
            await worker.Register(interaction)
        }
        if (interaction.options.getSubcommand() === "unregister") {
            await worker.Unregister(interaction)
        }
    }

    if(interaction.commandName === "ticket") {
        if(interaction.options.getSubcommand() === "panel") {
            await ticket.SendPanel(interaction);
        }
    }
}
