import { ButtonInteraction } from "discord.js";
import { Bonus } from "../class/Bonus";
import { Ticket } from "../class/Ticket";
import { getConfig } from "../util/getConfig";
import { Verify } from "../class/Verify";

export async function ButtonInteractions(interaction: ButtonInteraction) {
    const config = getConfig(interaction.guildId!);
    const bonus = new Bonus(interaction.guildId!);
    const ticket = new Ticket(interaction.guildId!);
    const verify = new Verify(interaction.guildId!);

    if (!config) return;

    if(interaction.customId === "bonus-payout") bonus.Payout(interaction);

    if (interaction.customId === "ticket-tuning") ticket.Create(interaction, "tuning", [config.workerRole])
    if (interaction.customId === "ticket-work") ticket.Create(interaction, "work", [config.teamRole])
    if (interaction.customId === "ticket-partnership") ticket.Create(interaction, "partnership")

    if (interaction.customId === "ticket-close") ticket.Close(interaction); 

    if (interaction.customId === "verify") verify.Verify(interaction);
}