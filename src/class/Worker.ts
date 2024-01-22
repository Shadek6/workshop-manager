import { ChatInputCommandInteraction, SlashCommandBuilder, PermissionsBitField, GuildMember, EmbedBuilder, GuildTextBasedChannel, Embed, TextBasedChannel } from "discord.js";
import { checkUserRoles } from "../util/checkPermissions";
import { IConfig } from "../types/Config";
import { getConfig } from "../util/getConfig";
import { Database } from "./Database";
import { client } from "..";

export class Worker {
    private Config: IConfig = {} as IConfig;
    private Mongo: Database = new Database(this.Config.guildId);

    constructor(guildId: string) {
        const fetchedConfig = getConfig(guildId);
        if (!fetchedConfig) return;

        this.Config = fetchedConfig;
    }
    public async Add(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        if (!this.Config.welcomeChannel) return interaction.editReply({ content: "Nie znaleziono kanału powitalnego." });

        const Worker = interaction.options.getUser("worker", true);
        const Nickname = interaction.options.getString("nickname", true);
        const fetchedUser = interaction.guild?.members.cache.get(interaction.user.id)!;
        const fetchedWorker = interaction.guild?.members.cache.get(Worker.id)!;
        const welcomeChannel = interaction.guild!.channels.cache.get(this.Config.welcomeChannel) as GuildTextBasedChannel | undefined;

        if (!fetchedUser) return interaction.editReply({ content: "Nie znaleziono użytkownika." });
        if (!welcomeChannel) return interaction.editReply({ content: "Nie znaleziono kanału powitalnego." });
        if (!checkUserRoles(fetchedUser, [this.Config.teamRole])) return interaction.editReply({ content: "Nie masz uprawnień do zarządzania pracownikami." });

        const Embed = this.buildWelcome(fetchedWorker);

        await fetchedWorker.setNickname(`${Nickname} | ${fetchedWorker.user.username}`);
        await fetchedWorker.roles.add(this.Config.workerRole);
        await welcomeChannel.send({ content: `<@${fetchedWorker.id}>`, embeds: [Embed] });
        return interaction.editReply({ content: `Dodano pracownika ${fetchedWorker.nickname || fetchedWorker.user.username}` });
    }

    public async Register(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        const char_name = interaction.options.getString("char_name", true);
        const account_number = interaction.options.getString("account_number", true);
        const phone_number = interaction.options.getString("phone_number", true);
        const user_id = interaction.user.id;
        const fetchedUser = interaction.guild?.members.cache.get(interaction.user.id)!;
        const contactChannel = interaction.guild?.channels.cache.get(this.Config.contactChannel) as GuildTextBasedChannel | undefined;

        if (!fetchedUser) return interaction.editReply({ content: "Nie znaleziono użytkownika." });
        if (!contactChannel) return interaction.editReply({ content: "Nie znaleziono kanału kontaktowego." });
        if (!checkUserRoles(fetchedUser, [this.Config.workerRole])) return interaction.editReply({ content: "Nie masz uprawnień do zarejestrowania się!" });
        if (await this.Mongo.getWorker(user_id)) return interaction.editReply({ content: "Jesteś już zarejestrowany." });
        if (!char_name.includes(" ") || phone_number.length !== 6 || account_number.length !== 10) return interaction.editReply({ content: "Nieprawidłowe dane!" });

        const Embed = this.buildContact(char_name, phone_number, account_number, fetchedUser);

        const sentEmbed = await contactChannel.send({ content: `<@${fetchedUser.id}>`, embeds: [Embed] });
        await this.Mongo.addWorker(user_id, char_name, account_number, phone_number, sentEmbed.id);
        await interaction.editReply({ content: "Zarejestrowano!" });
        return;
    }

    public async Unregister(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true });
        if (!checkUserRoles(interaction.member as GuildMember, [this.Config.teamRole]))
            return interaction.editReply({ content: "Nie masz uprawnień do wyrejestrowania pracownika." });

        const fetchedDbUser = await this.Mongo.getWorker(interaction.options.getString("worker", true));
        if (!fetchedDbUser) return interaction.editReply({ content: "Nie znaleziono pracownika." });

        const contactChannel = interaction.guild?.channels.cache.get(this.Config.contactChannel) as TextBasedChannel | undefined;
        if (!contactChannel) return interaction.editReply({ content: "Nie znaleziono kanału kontaktowego." });

        this.Mongo.deleteWorker(fetchedDbUser.user_id);

        await interaction.editReply({ content: "Wyrejestrowano pracownika." });
        return;
    }

    private buildContact(char_name: string, phone_number: string, account_number: string, fetchedUser: GuildMember) {
        const Embed = new EmbedBuilder()
            .setTitle(fetchedUser.user.username)
            .setThumbnail(fetchedUser.user.displayAvatarURL() || null)
            .addFields({ name: "Character", value: char_name }, { name: "Phone", value: phone_number }, { name: "Bank Account", value: account_number })
            .setTimestamp();

        return Embed;
    }

    private buildWelcome(User: GuildMember) {
        const Embed = new EmbedBuilder()
            .setTitle(`Witaj w zespole ${User.nickname || User.user.username}!`)
            .setColor("Green")
            .setDescription(this.Config.welcomeMessage || null)
            .setThumbnail(this.Config.guildLogo || null)
            .setTimestamp()
            .addFields({ name: "Premia", value: `<#${this.Config.bonusChannel}>`, inline: true }, { name: "Kontakt", value: `<#${this.Config.contactChannel}>`, inline: true });

        return Embed;
    }
}

export const data = new SlashCommandBuilder()
    .setName("worker")
    .setDescription("Zarządzanie pracownikami")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ModerateMembers)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("add")
            .setDescription("Dodaj pracownika")
            .addUserOption((option) => option.setName("worker").setDescription("Pracownik do dodania").setRequired(true))
            .addStringOption((option) => option.setName("nickname").setDescription("Nickname IC pracownika").setRequired(true))
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("register")
            .setDescription("Zarejestruj się jako pracownik")
            .addStringOption((option) => option.setName("char_name").setDescription("Nick IC").setRequired(true))
            .addStringOption((option) => option.setName("account_number").setDescription("Numer konta").setRequired(true))
            .addStringOption((option) => option.setName("phone_number").setDescription("Numer telefonu").setRequired(true))
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("unregister")
            .setDescription("Wyrejestruj pracownika.")
            .addStringOption((option) => option.setName("worker").setDescription("Pracownik do wyrejestrowania").setRequired(true))
    );
