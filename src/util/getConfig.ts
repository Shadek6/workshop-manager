import fs from "fs";
import { IConfig } from "../types/Config";
export function getConfig(guildId: string) {
    if(!fs.existsSync(`./src/config/guilds/${guildId}.json`)) return null;
    return JSON.parse(fs.readFileSync(`./src/config/guilds/${guildId}.json`, "utf-8")) as IConfig;
}