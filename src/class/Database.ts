import { MongoClient } from 'mongodb';
import { IConfig } from '../types/Config';
import { getConfig } from '../util/getConfig';

export class Database {
    private client: MongoClient;
    private uri: string;
    private guildConfig: IConfig | null;

    constructor(guildId: string) {
        this.uri = process.env.MONGO_URI!;
        this.client = new MongoClient(this.uri);
        this.guildConfig = getConfig(guildId);
    }

    public async addWorker(user_id: string, char_name: string, account_number: string, phone_number: string, message_id: string) {
        const database = this.client.db(this.guildConfig?.dbName);
        const collection = database.collection("workers");

        return collection.insertOne({ user_id: user_id, char_name: char_name, account_number: account_number, phone_number: phone_number, message_id: message_id });
    }

    public async getWorker(user_id: string) {
        const database = this.client.db(this.guildConfig?.dbName);
        const collection = database.collection("workers");

        return collection.findOne({ user_id: user_id });
    }

    public async deleteWorker(user_id: string) {
        const database = this.client.db(this.guildConfig?.dbName);
        const collection = database.collection("workers");

        return collection.deleteOne({ user_id: user_id });
    }
}