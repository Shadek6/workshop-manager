import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { REST, Routes } from 'discord.js';

const client = process.env.CLIENT_ID!;
const token = process.env.TOKEN!;

const commands: any[] = [];
const commandsPath = path.join(__dirname, "class");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".ts"));
const rest = new REST({ version: "10" }).setToken(token);

rest.put(Routes.applicationCommands(client), { body: commands }).then(() => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath) // eslint-disable-line @typescript-eslint/no-var-requires
        if(!command.data) continue
        commands.push(command.data.toJSON());
    }
    
    
    rest.put(Routes.applicationCommands(client), { body: commands })
        .then(() => console.log("Successfully registered application commands."))
        .catch(console.error);
})