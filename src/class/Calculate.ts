import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { checkUserRoles } from "../util/checkPermissions";

export class Calculate {
    private Interaction: ChatInputCommandInteraction;
    constructor(Interaction: ChatInputCommandInteraction) {
        this.Interaction = Interaction;
    }
    public async Calculate() {
        await this.Interaction.deferReply({ ephemeral: true });
        const expression = this.Interaction.options.getString("expression", true);
        const fetchedUser = this.Interaction.guild!.members.cache.get(this.Interaction.user.id)!;

        if (!expression) return this.Interaction.editReply({ content: "Nie podano wyrażenia." });
        if (!fetchedUser) return this.Interaction.editReply({ content: "Nie znaleziono użytkownika." });
        if (!checkUserRoles(fetchedUser, [""])) return this.Interaction.editReply({ content: "Nie masz uprawnień." });

        return this.Interaction.editReply({ content: `\`${expression}\` is equal to \`${eval(expression)}\`` })
    }
}

export const data = new SlashCommandBuilder()
    .setName("calculate")
    .setDescription("Kalkulator.")
    .addStringOption((option) => option.setName("expression").setDescription("Wyrażenie do przeliczenia.").setRequired(true))