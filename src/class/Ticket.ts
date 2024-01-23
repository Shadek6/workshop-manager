import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChannelType, ChatInputCommandInteraction, Embed, EmbedBuilder, OverwriteResolvable, SlashCommandBuilder, TextChannel } from "discord.js";
import { IConfig } from "../types/Config";
import { getConfig } from "../util/getConfig";
import { buildButton } from "../util/buildButton";

export class Ticket {
    private Config: IConfig = {} as IConfig;

    constructor(guildId: string) {
        const fetchedConfig = getConfig(guildId);
        if (!fetchedConfig) return;

        this.Config = fetchedConfig;
    }

    public async Create(interaction: ButtonInteraction, ticketPanel: string, accessRoles?: string[]) {
        await interaction.deferReply({ ephemeral: true })
        const rolesWithAccess = [];

        if (accessRoles) {
            for (const role of accessRoles) {
                const access: OverwriteResolvable = {
                    id: role,
                    allow: ["ViewChannel"],
                };
                rolesWithAccess.push(access);
            }
        }

        const ticketChannel = await interaction.guild?.channels.create({
            name: `${ticketPanel}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: this.Config.ticketCategory || null,
            permissionOverwrites: [
                {
                    id: interaction.user.id,
                    allow: ["ViewChannel"],
                },
                {
                    id: interaction.guild!.roles.everyone,
                    deny: ["ViewChannel"],
                },
                ...rolesWithAccess,
            ],
        });

        if (!ticketChannel) return interaction.editReply({ content: "Nie udało się utworzyć ticketu." });

        let pingMessage = "";
        if (accessRoles) {
            for (const role of accessRoles) {
                pingMessage += `<@&${role}>`
            }
        }

        let ticketEmbed: Embed | EmbedBuilder = {} as Embed;
        const CloseButton = buildButton("DANGER", "ticket-close", "Zamknij ticket", "🔒");
        const ActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(CloseButton);

        if(ticketPanel === "tuning") ticketEmbed = await this.buildWelcomeEmbed("Ticket - Tuning", this.Config.tuningTicketMessage || undefined);
        if(ticketPanel === "work") ticketEmbed = await this.buildWelcomeEmbed("Ticket - Praca", this.Config.workTicketMessage || undefined);
        if(ticketPanel === "partnership") ticketEmbed = await this.buildWelcomeEmbed("Ticket - Współpraca", this.Config.partnershipTicketMessage || undefined);

        await ticketChannel.send({ content: `Ticket utworzony przez <@${interaction.user.id}>\n${pingMessage}`, components: [ActionRow], embeds: [ticketEmbed]});
        return interaction.editReply({ content: `Ticket utworzony: ${ticketChannel}` });
    }

    public async SendPanel(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const panelEmbed = await this.buildPanel();
        const TuningButton = buildButton("PRIMARY", "ticket-tuning", "Tuning", "🔧");
        const WorkButton = buildButton("PRIMARY", "ticket-work", "Praca", "👷");
        const PartnershipButton = buildButton("PRIMARY", "ticket-partnership", "Współpraca", "🤝");
        const ActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(TuningButton, WorkButton, PartnershipButton);

        await interaction.channel?.send({ embeds: [panelEmbed], components: [ActionRow] });
        return interaction.editReply({ content: "Wysłano panel ticketowy." });
    }

    public async Close(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true })
        if (!this.Config.archiveCategory) return interaction.editReply({ content: "Nie znaleziono kategorii archiwum." });
        if (!interaction.channel) return interaction.editReply({ content: "Nie znaleziono kanału." });

        await interaction.editReply({ content: "Ticket zostanie zamknięty za 5 sekund..." });
        setTimeout(async () => {
            await (interaction.channel as TextChannel).setParent(this.Config.archiveCategory);
            await (interaction.channel as TextChannel).permissionOverwrites.set([]);
            await interaction.channel!.send({ content: "# Ticket został zamknięty." });
        }, 5000)
    }

    private buildPanel() {
        const panelEmbed = new EmbedBuilder()
            .setTitle("Panel ticketowy")
            .setColor("Green")
            .setThumbnail(this.Config?.guildLogo || null)
            .setTimestamp()
            .setDescription("Wybierz kategorię ticketu, który chcesz utworzyć.");
        
        return panelEmbed
    }

    private async buildWelcomeEmbed(title: string, description?: string) {
        const Embed = new EmbedBuilder()
            .setTitle(title)
            .setColor("Random")
            .setDescription(description || null)
            .setThumbnail(this.Config?.guildLogo || null)
            .setTimestamp();
        
        return Embed;
    }
}

export const data = new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Zarządzanie ticketami")
    .setDMPermission(false)
    .addSubcommand((subcommand) => subcommand.setName("panel").setDescription("Wyślij panel do tworzenia ticketów"));
