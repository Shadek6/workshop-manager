import { ChatInputCommandInteraction } from "discord.js";
import { Config } from "../class/Config";
import { Bonus } from "../class/Bonus";
import { Worker } from "../class/Worker";
import { Ticket } from "../class/Ticket";
import { Calculate } from "../class/Calculate";

export async function ChatInteractions(interaction: ChatInputCommandInteraction) {
    const config = new Config();
    
    if (!config.Exists(interaction.guildId!) && interaction.options.getSubcommand() !== "create") return;
    const bonus = new Bonus(interaction.guildId!);
    const worker = new Worker(interaction.guildId!);
    const ticket = new Ticket(interaction.guildId!)
    const calculate = new Calculate(interaction)

    if (interaction.commandName === "config") {
        if (interaction.options.getSubcommand() === "create") {
            config.Create(interaction);
        }
        if (interaction.options.getSubcommand() === "update") {
            config.Update(interaction);
        }
        if (interaction.options.getSubcommand() === "add-worker-percentage") {
            config.AddWorkerPercentage(interaction);
        }
        if (interaction.options.getSubcommand() === "clear-worker-percentage") {
            config.ClearWorkerPercentage(interaction);
        }
        if (interaction.options.getSubcommand() === "refresh") {
            config.Refresh(interaction);
        }
        if (interaction.options.getSubcommand() === "show") {
            config.Show(interaction);
        }
    }

    if (interaction.commandName === "premia") {
        if (interaction.options.getSubcommand() === "add") {
            await bonus.Add(interaction);
        }
    }

    if (interaction.commandName === "worker") {
        if (interaction.options.getSubcommand() === "add") {
            worker.Add(interaction)
        }
        if (interaction.options.getSubcommand() === "register") {
            worker.Register(interaction)
        }
        if (interaction.options.getSubcommand() === "unregister") {
            worker.Unregister(interaction)
        }
    }

    if(interaction.commandName === "ticket") {
        if(interaction.options.getSubcommand() === "panel") {
            ticket.SendPanel(interaction);
        }
    }

    if (interaction.commandName === "calculate") {
        calculate.Calculate();
    }
}
