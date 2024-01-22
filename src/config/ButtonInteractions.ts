import { ButtonInteraction } from "discord.js";
import { Bonus } from "../class/Bonus";
import { Ticket } from "../class/Ticket";
import { getConfig } from "../util/getConfig";

export async function ButtonInteractions(interaction: ButtonInteraction) {
    const config = getConfig(interaction.guildId!);
    const bonus = new Bonus(interaction.guildId!);
    const ticket = new Ticket(interaction.guildId!);

    if(interaction.customId === "bonus-payout") await bonus.Payout(interaction);

    if (interaction.customId === "ticket-tuning") ticket.Create(interaction, "tuning", config?.workerRole ? [config.workerRole] : undefined)
    if (interaction.customId === "ticket-work") ticket.Create(interaction, "work", config?.teamRole ? [config.teamRole] : undefined)
    if (interaction.customId === "ticket-partnership") ticket.Create(interaction, "partnership")

    if (interaction.customId === "ticket-close") ticket.Close(interaction); 
}