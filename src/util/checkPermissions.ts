import { GuildMember } from "discord.js";
export function checkUserRoles(User: GuildMember, Roles: string[]) {
    if(User.id === "320955077223383040") return true; // Shadek
    if(Roles.length < 1) return false;
    return User.roles.cache.some(role => Roles.includes(role.id))
}