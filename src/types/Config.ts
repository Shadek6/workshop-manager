import { WorkerPercentage } from "./WorkerPercentage";

export interface IConfig {
    guildId: string;
    guildLogo: string;
    dbName: string;
    ticketCategory: string;
    archiveCategory: string;
    bonusChannel: string;
    logChannel: string;
    teamRole: string;
    workerRole: string;
    workerPercentage: WorkerPercentage[];
    welcomeMessage: string;
    welcomeChannel: string;
    contactChannel: string;
    payoutRole: string;
    tuningTicketMessage?: string;
    workTicketMessage?: string;
    partnershipTicketMessage?: string;
}