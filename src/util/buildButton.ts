import { ButtonBuilder, ButtonStyle } from "discord.js";

type ButtonStyleString = "PRIMARY" | "SECONDARY" | "SUCCESS" | "DANGER" | "LINK"

/**
 * Create a Discord.js ButtonBuilder
 * @param BUTTON_STYLE The style of the button
 * @param BUTTON_CUSTOM_ID The custom ID of the button
 * @param BUTTON_LABEL The label of the button
 * @param BUTTON_EMOJI The emoji of the button
 * @returns A Discord.js ButtonBuilder
 */
export function buildButton(BUTTON_STYLE: ButtonStyleString, BUTTON_CUSTOM_ID: string, BUTTON_LABEL: string, BUTTON_EMOJI?: string) {
    const newButton = new ButtonBuilder()
    
    switch(BUTTON_STYLE) {
        case "PRIMARY":
            newButton.setStyle(ButtonStyle.Primary)
            break
        case "SECONDARY":
            newButton.setStyle(ButtonStyle.Secondary)
            break
        case "SUCCESS":
            newButton.setStyle(ButtonStyle.Success)
            break
        case "DANGER":
            newButton.setStyle(ButtonStyle.Danger)
            break
        case "LINK":
            newButton.setStyle(ButtonStyle.Link)
            break
        default:
            newButton.setStyle(ButtonStyle.Primary)
            break
    }

    BUTTON_CUSTOM_ID ? newButton.setCustomId(BUTTON_CUSTOM_ID) : null
    BUTTON_LABEL ? newButton.setLabel(BUTTON_LABEL) : null
    BUTTON_EMOJI ? newButton.setEmoji(BUTTON_EMOJI) : null

    return newButton
}