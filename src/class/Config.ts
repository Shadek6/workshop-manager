import fs from "fs";
import { ChatInputCommandInteraction, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { IConfig } from "../types/Config";
import { WorkerPercentage } from "../types/WorkerPercentage";

export class Config {
    public async Create(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const ConfigFilePath = `./src/config/guilds/${interaction.guildId}.json`;
        const params: IConfig = {
            guildId: interaction.guildId!,
            guildLogo: interaction.guild!.iconURL()!,
            dbName: "",
            ticketCategory: "",
            archiveCategory: "",
            bonusChannel: "",
            logChannel: "",
            teamRole: "",
            workerRole: "",
            workerStartRole: "",
            workerPercentage: [] as WorkerPercentage[],
            welcomeMessage: "",
            welcomeChannel: "",
            contactChannel: "",
            payoutRole: ""
        };

        if (fs.existsSync(ConfigFilePath)) return;

        fs.writeFile(ConfigFilePath, JSON.stringify(params), async (err) => {
            if (err) {
                console.error(err);
                return interaction.editReply({ content: "An error occured while creating the config file." });
            }
            return interaction.editReply({ content: "Successfully created the config file." });
        });
    }

    public async Update(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const ConfigFilePath = `./src/config/guilds/${interaction.guildId}.json`;
        const Key = interaction.options.getString("key", true);
        const Value = interaction.options.getString("value", true);
        if (!fs.existsSync(ConfigFilePath)) return interaction.editReply({ content: "There is no config file for this server." });

        const params = JSON.parse(fs.readFileSync(ConfigFilePath, "utf-8"));
        fs.writeFile(ConfigFilePath, JSON.stringify({ ...params, [Key]: Value }), async (err) => {
            if (err) {
                console.error(err);
                return interaction.editReply({ content: "An error occured while updating the config file." });
            }

            return interaction.editReply({ content: "Successfully updated the config file." });
        });
    }

    public async Refresh(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const ConfigFilePath = `./src/config/guilds/${interaction.guildId}.json`;
        const params = JSON.parse(fs.readFileSync(ConfigFilePath, "utf-8"));

        fs.writeFile(ConfigFilePath, JSON.stringify({ ...params, guildLogo: interaction.guild!.iconURL()! }), async (err) => {
            if (err) {
                console.error(err);
                return interaction.editReply({ content: "An error occured while updating the config file." });
            }

            return interaction.editReply({ content: "Successfully updated the config file." });
        });
    }

    public async Show(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const ConfigFilePath = `./src/config/guilds/${interaction.guildId}.json`;
        const params = JSON.parse(fs.readFileSync(ConfigFilePath, "utf-8"));

        return interaction.editReply({ content: `\`\`\`json\n${JSON.stringify(params, null, 2)}\`\`\`` });
    }

    public Exists(guildId: string) {
        const ConfigFilePath = `./src/config/guilds/${guildId}.json`;
        if (!fs.existsSync(ConfigFilePath)) return false;
        return true;
    }

    public async AddWorkerPercentage(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const ConfigFilePath = `./src/config/guilds/${interaction.guildId}.json`;
        const Role = interaction.options.getRole("role", true);
        const Percentage = interaction.options.getNumber("percentage", true);

        const params = JSON.parse(fs.readFileSync(ConfigFilePath, "utf-8"));
        fs.writeFile(ConfigFilePath, JSON.stringify({ ...params, workerPercentage: [...params.workerPercentage, { roleId: Role.id, percentage: Percentage }] }), async (err) => {
            if (err) {
                console.error(err);
                return interaction.editReply({ content: "An error occured while updating the config file." });
            }

            return interaction.editReply({ content: "Successfully updated the config file." });
        });
    }

    public async ClearWorkerPercentage(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const ConfigFilePath = `./src/config/guilds/${interaction.guildId}.json`;

        const params = JSON.parse(fs.readFileSync(ConfigFilePath, "utf-8"));
        fs.writeFile(ConfigFilePath, JSON.stringify({ ...params, workerPercentage: [] }), async (err) => {
            if (err) {
                console.error(err);
                return interaction.editReply({ content: "An error occured while updating the config file." });
            }

            return await interaction.editReply({ content: "Successfully updated the config file." });
        });
    }
}

export const data = new SlashCommandBuilder()
    .setName("config")
    .setDescription("Configure the bot for your server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand((subcommand) => subcommand.setName("create").setDescription("Creates config for your server"))
    .addSubcommand((subcommand) => subcommand.setName("refresh").setDescription("Refreshes config for your server"))
    .addSubcommand((subcommand) =>
        subcommand
            .setName("update")
            .setDescription("Updates a config for your server")
            .addStringOption((option) =>
                option
                    .setName("key")
                    .setDescription("The key to update")
                    .addChoices(
                        { name: "dbName", value: "dbName" },
                        { name: "ticketCategory", value: "ticketCategory" },
                        { name: "archiveCategory", value: "archiveCategory" },
                        { name: "bonusChannel", value: "bonusChannel" },
                        { name: "logChannel", value: "logChannel" },
                        { name: "teamRole", value: "teamRole" },
                        { name: "workerRole", value: "workerRole" },
                        { name: "workerStartRole", value: "workerStartRole" },
                        { name: "welcomeMessage", value: "welcomeMessage"},
                        { name: "contactChannel", value: "contactChannel" },
                        { name: "welcomeChannel", value: "welcomeChannel"},
                        { name: "payoutRole", value: "payoutRole"},
                        { name: "tuningTicketMessage", value: "tuningTicketMessage"},
                        { name: "workTicketMessage", value: "workTicketMessage"},
                        { name: "partnershipTicketMessage", value: "partnershipTicketMessage"}
                    )
                    .setRequired(true)
            )
            .addStringOption((option) => option.setName("value").setDescription("New value of option.").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("show").setDescription("Responds with full config of your server."))
    .addSubcommand((subcommand) =>
        subcommand
            .setName("add-worker-percentage")
            .setDescription("Add a worker percentage")
            .addRoleOption((option) => option.setName("role").setDescription("Role to add percentage").setRequired(true))
            .addNumberOption((option) => option.setName("percentage").setDescription("Percentage of worker").setRequired(true))
    )
    .addSubcommand((subcommand) => subcommand.setName("clear-worker-percentage").setDescription("Clear worker percentage array."));