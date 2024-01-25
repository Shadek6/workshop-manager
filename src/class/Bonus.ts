import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ChatInputCommandInteraction, EmbedBuilder, Guild, GuildMember, GuildTextBasedChannel, SlashCommandBuilder } from "discord.js";
import { getConfig } from "../util/getConfig";
import { IConfig } from "../types/Config";
import { Database } from "./Database";
import { WithId, Document } from "mongodb";
import { buildButton } from "../util/buildButton";
import { client } from "..";
import { checkUserRoles } from "../util/checkPermissions";

export class Bonus {
    private Config: IConfig = {} as IConfig;
    private Mongo: Database = {} as Database;

    constructor(guildId: string) {
        const fetchedConfig = getConfig(guildId);
        if (!fetchedConfig) return;

        this.Config = fetchedConfig;
        this.Mongo = new Database(guildId);
    }
    public async Add(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const Amount = interaction.options.getNumber("kwota", true);
        const toReturn = interaction.options.getBoolean("zwrot", true);
        const fetchedUser = interaction.guild?.members.cache.get(interaction.user.id)!;
        const characterData = await this.Mongo.getWorker(interaction.user.id);
        const userRoles = interaction.guild?.members.cache.get(interaction.user.id)?.roles.cache;
        const bonusChannel = interaction.guild!.channels.cache.get(this.Config.bonusChannel) as GuildTextBasedChannel | undefined;
        let toPayout: number | undefined;

        if (!bonusChannel) return await interaction.editReply({ content: "Nie znaleziono kanału do wypłat." });
        if (!userRoles) return await interaction.editReply({ content: "Nie udało się pobrać ról użytkownika!" });
        if (!fetchedUser) return await interaction.editReply({ content: "Nie znaleziono użytkownika." });
        if (!characterData) return await interaction.editReply({ content: "Nie znaleziono danych postaci w bazie." });
        if (!checkUserRoles(fetchedUser, [this.Config.workerRole])) return await interaction.editReply({ content: "Nie jesteś pracownikiem." });

        for (const role of this.Config.workerPercentage) {
            if (userRoles.some((r) => r.id === role.roleId)) toPayout = toReturn ? Amount : Amount * role.percentage;
        }

        if (!toPayout) return await interaction.editReply({ content: "Nie znaleziono roli pracowniczej." });

        const Embed = this.buildEmbed(fetchedUser, characterData, Amount, toPayout, toReturn);
        const PayoutButton = buildButton("SUCCESS", "bonus-payout", "Wypłać", "💸");
        const ActionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(PayoutButton);
        await interaction.editReply({ content: `Próba wysłania wiadomości na kanał <#${this.Config.bonusChannel}>` });
        return await bonusChannel.send({ content: `<@${interaction.user.id}>`, embeds: [Embed], components: [ActionRow] });
    }

    private buildEmbed(User: GuildMember, CharacterData: WithId<Document>, Amount: number, toPayout: number, toReturn: boolean) {
        const NegativeEmoji = client.emojis.cache.get("1198749394112098457") || "❌";
        const bonusEmbed = new EmbedBuilder()
            .setTitle(`Premia - ${((toPayout / Amount) * 100).toFixed(0)}%`)
            .setColor("Green")
            .setAuthor({ name: User.nickname || User.user.username, iconURL: User.user.displayAvatarURL() || undefined })
            .setThumbnail(this.Config?.guildLogo || null)
            .setTimestamp()
            .addFields(
                { name: "Imię i nazwisko", value: `${CharacterData.char_name}`, inline: true },
                { name: "Data", value: `${new Date(Date.now()).toLocaleDateString("pl-PL")} ${new Date().getUTCHours() + 1}:${new Date().getUTCMinutes()}`, inline: true },
                { name: "Robocizna", value: `$${Amount}`, inline: true },
                { name: "Premia", value: `$${toPayout.toFixed(0)}`, inline: true },
                { name: "Numer Konta", value: `${CharacterData.account_number}`, inline: true },
                { name: "Zwrot", value: `${toReturn ? "TAK" : "NIE"}`, inline: true },
                { name: "Status", value: `${NegativeEmoji}`, inline: false },
                { name: "Wypłacone przez", value: "-", inline: false }
            );

        return bonusEmbed;
    }

    public async Payout(interaction: ButtonInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const PositiveEmoji = client.emojis.cache.get("1198749355214114867") || "✅";
        const fetchedUser = interaction.guild?.members.cache.get(interaction.user.id)!;
        const messageEmbed = interaction.message.embeds[0];

        if (!fetchedUser) return await interaction.editReply({ content: "Nie znaleziono użytkownika." });
        if (!messageEmbed) return await interaction.editReply({ content: "Nie znaleziono wiadomości." });
        if (!this.Config.payoutRole) return await interaction.editReply({ content: "Nie znaleziono roli do wypłat." });

        if (!checkUserRoles(fetchedUser, [this.Config.payoutRole])) return await interaction.editReply({ content: "Nie masz uprawnień do wypłaty premii." });

        const ThanksEmbed = this.buildThanksEmbed(fetchedUser, interaction.guild!, messageEmbed.fields[3].value);
        const embedAuthor = interaction.guild?.members.cache.find(m => m.nickname === messageEmbed.author?.name || m.user.username === messageEmbed.author?.name)

        messageEmbed.fields[6].value = `${PositiveEmoji}`;
        messageEmbed.fields[7].value = `${fetchedUser.nickname || fetchedUser.user.username}`;

        if(embedAuthor) await embedAuthor.send({ embeds: [ThanksEmbed] });

        await interaction.message.edit({ embeds: [messageEmbed], components: [] });
        return await interaction.editReply({ content: "Wypłacono premię." });
    }

    private buildThanksEmbed(author: GuildMember, guild: Guild, bonusAmount: string) {
        const embed = new EmbedBuilder()
            .setTitle("Twoja premia została wypłacona!")
            .setDescription(`Dziękujemy za pracę w **${guild.name}**. Twoja premia w wysokości \`${bonusAmount}\` została wypłacona na konto bankowe.`)
            .setColor("Green")
            .setThumbnail(guild.iconURL() || null)
            .setAuthor({ name: author.nickname || author.user.username, iconURL: author.avatarURL() || undefined })
            .setTimestamp()
        return embed;
    }
}

export const data = new SlashCommandBuilder()
    .setName("premia")
    .setDescription("Zarządzanie premiami")
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("add")
            .setDescription("Add a bonus")
            .addNumberOption((option) => option.setName("kwota").setDescription("Kwota robocizny").setRequired(true))
            .addBooleanOption((option) => option.setName("zwrot").setDescription("Czy zwrócić za tuning własnego pojazdu?").setRequired(true))
    );
