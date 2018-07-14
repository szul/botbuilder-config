import * as fs from "fs";
import * as shelljs from "shelljs";
import * as path from "path";
import * as crypto from "crypto";

/**
 * @module botbuilder-config
 */

export interface Service {
    type: string
    , name?: string
    , id?: string
    , appId?: string
    , appPassword?: string
    , endpoint?: string
    , endpointKey?: string
    , version?: string
    , authoringKey?: string
    , subscriptionKey?: string
    , kbId?: string
    , hostname?: string
}

export interface BotConfiguration {
    name?: string
    , description?: string
    , secretKey?: string
    , services: Service[]
}

export class BotConfig {
    private _botConfiguration: BotConfiguration;
    private readonly _encryptedProperties = {
        endpoint: ['appPassword'],
        abs: ['appPassword'],
        luis: ['authoringKey', 'subscriptionKey'],
        qna: ['subscriptionKey'],
        dispatch: ['authoringKey', 'subscriptionKey']
    };
    constructor(private readonly botFilePath?: string, private readonly secret?: string) {
        this.init();
    }
    private init(): BotConfig {
        this._botConfiguration = this.parseBotFile();
        return this;
    }
    private parseBotFile(): BotConfiguration {
        var botFile = (this.botFilePath !== null) ? this.botFilePath : this.getBotFileInDirectory();
        return this.parse(botFile);
    }
    private getBotFileInDirectory(): string {
        var botFile: string;
        var dir = shelljs.pwd().toString();
        var files: string[] = fs.readdirSync(dir);
        files.forEach((f: string) => {
            if(f.endsWith(".bot")) {
                if(botFile !== null) {
                    throw new Error("Error: Multiple *.bot files in this project directory.");
                }
                botFile = path.join(dir, f);
            }
        });
        if(botFile === null) {
            throw new Error ("Error: No *.bot file found in the current working directory.");
        }
        return botFile;
    }
    private parse(botFile: string): BotConfiguration {
        var f: string = fs.readFileSync(botFile, "utf-8"); //Might need to account for other encodings.
        return <BotConfiguration>JSON.parse(f);
    }
    private getService(type: string): Service | Service[] {
        switch(type.toLowerCase()) {
            case "endpoint":
            case "abs":
            case "luis":
            case "qna":
            case "dispatch":
                this.parseService(type);
            default:
                throw new Error("Error: Invalid Bot Service [type] specified.");
        }
    }
    private parseService(type: string): Service | Service[] {
        var services: Service[] = [];
        this._botConfiguration.services.forEach((s: Service, idx: number) => {
            if(s.type === type) {
                services.push(this.decrypt(s));
            }
        });
        if(services.length === 0) {
            throw new Error(`Error: No services of type: ${type} found in your bot file.`);
        }
        return (services.length === 1 ? services[0] : services);
    }
    private decrypt(s: Service): Service {
        if(this.secret === null) {
            return s;
        }
        var encryptedProps: string[] = this._encryptedProperties[s.type];
        for(let k in s) {
            if(s.hasOwnProperty(k) && encryptedProps.indexOf(k) != -1) {
                s[k] = this.decryptValue(s[k]);
            }
        }
        return s;
    }
    private decryptValue(v: string): string {
        let orig = v;
        try {
            const decipher = crypto.createDecipher('aes192', this.secret);
            let value = decipher.update(v, 'hex', 'utf8');
            value += decipher.final('utf8');
            return value;
        }
        catch(e) {
            console.log(`Error: Failed to decrypt value ${orig}. Maybe you already decrypted it. Returning original value.`);
            return orig;
        }
    }
    public Endpoint(): Service | Service[] {
        return this.parseService("endpoint");
    }
    public BotService(): Service | Service[] {
        return this.parseService("abs");
    }
    public LUIS(): Service | Service[] {
        return this.parseService("luis");
    }
    public QnAMaker(): Service | Service[] {
        return this.parseService("qna");
    }
    public Dispatch(): Service | Service[] {
        return this.parseService("dispatch");
    }
}
