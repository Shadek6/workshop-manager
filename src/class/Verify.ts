import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChatInputCommandInteraction, EmbedBuilder, Message, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { IConfig } from "../types/Config";
import { getConfig } from "../util/getConfig";
import { buildButton } from "../util/buildButton";

export class Verify {
    private Config: IConfig = {} as IConfig;

    constructor(guildId: string) {
        const serverConfig = getConfig(guildId);
        if (!serverConfig) return;
        this.Config = serverConfig;
    }

    public async SendPanel(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const embed = this.BuildPanelEmbed();
        const button = buildButton("PRIMARY", "verify", "Zweryfikuj się", "🔒");
        const ActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        if (!interaction.channel) return interaction.editReply({ content: "Nie znaleziono kanału." });
        if (!this.Config.verifiedRole) return interaction.editReply({ content: "Nie ustawiono roli nadawanej dla zweryfikowanych użytkowników." });

        interaction.channel.send({ embeds: [embed], components: [ActionRow] })
            .then((message: Message) => {
                if (!message) return interaction.editReply({ content: "Nie udało się wysłać panelu." });
                interaction.editReply({ content: "Poprawnie wysłano panel weryfikacji." });
            })
            .catch()
    }

    public async Verify(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const member = interaction.guild!.members.cache.get(interaction.user.id);
        if (!member) return interaction.editReply({ content: "Nie znaleziono użytkownika." });
        if (!this.Config.verifiedRole) return interaction.editReply({ content: "Nie ustawiono roli nadawanej dla zweryfikowanych użytkowników." });

        member.roles.add(this.Config.verifiedRole)
            .then(() => interaction.editReply({ content: "Poprawnie zweryfikowano użytkownika." }))
            .catch(() => interaction.editReply({ content: "Nie udało się zweryfikować użytkownika." }));
    }

    private BuildPanelEmbed() {
        const embed = new EmbedBuilder()
            .setTitle("Weryfikacja")
            .setDescription("Kliknij przycisk poniżej, aby się zweryfikować.")
            .setColor("Random")
            .setThumbnail(this.Config.guildLogo + "?size=4096" || null)
        
        return embed;
    }
}

export const data = new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Zarządzanie weryfikacją.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand((subcommand) => subcommand
        .setName("panel")
        .setDescription("Wyślij panel weryfikacji.")
    )