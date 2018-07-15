import { BotConfiguration, Service, EndpointService, AzureBotService, LUISService, QnAMakerService, DispatchService } from "./types"
import * as fs from "fs";
import * as shelljs from "shelljs";
import * as path from "path";
import * as crypto from "crypto";

/**
 * @module botbuilder-config
 */

export class BotConfig {
    private _botConfiguration: BotConfiguration;
    private readonly _encryptedProperties = {
        endpoint: ["appPassword"],
        abs: ["appPassword"],
        luis: ["authoringKey", "subscriptionKey"],
        qna: ["subscriptionKey"],
        dispatch: ["authoringKey", "subscriptionKey"]
    }; //Encrypted properties sourced from Microsoft's MSBot CLI source code.
    constructor(private readonly botFilePath?: string, private readonly secret?: string) {
        this.init();
    }
    private init(): BotConfig {
        this._botConfiguration = this.parseBotFile();
        return this;
    }
    private parseBotFile(): BotConfiguration {
        let botFile = (this.botFilePath !== null) ? this.botFilePath : this.getBotFileInDirectory();
        return this.parse(botFile);
    }
    private getBotFileInDirectory(): string {
        let botFile: string;
        let dir = shelljs.pwd().toString();
        let files: string[] = fs.readdirSync(dir);
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
        let f: string = fs.readFileSync(botFile, "utf-8"); //Might need to account for other encodings.
        return <BotConfiguration>JSON.parse(f);
    }
    private getService(type: string): Service {
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
    private parseService(type: string, name?: string): Service {
        let services: Service[] = [];
        this._botConfiguration.services.forEach((s: Service, idx: number) => {
            if(s.type === type && (name == null || s.name === name)) {
                s.encryptionChecked = false;
                services.push(this.decrypt(s));
            }
        });
        if(services.length === 0) {
            if(name != null) {
                throw new Error(`Error: No services of type: ${type} and name: ${name} found in your bot file.`);
            }
            throw new Error(`Error: No services of type: ${type} found in your bot file.`);
        }
        return services[0];
    }
    private decrypt(s: Service): Service {
        if(this.secret === null || s.encryptionChecked === true) {
            s.encryptionChecked = true;
            return s;
        }
        let encryptedProps: string[] = this._encryptedProperties[s.type];
        for(let k in s) {
            if(s.hasOwnProperty(k) && encryptedProps.indexOf(k) != -1) {
                s[k] = this.decryptProperty(s[k]);
            }
        }
        s.encryptionChecked = true;
        return s;
    }
    private decryptProperty(v: string): string {
        let orig = v;
        try {
            let decipher = crypto.createDecipher("aes192", this.secret); //Decryption values sourced from Microsoft's MSBot CLI source code. If this breaks, look there to see if values have changed.
            let prop = decipher.update(v, "hex", "utf8");
            prop += decipher.final("utf8");
            return prop;
        }
        catch(e) {
            console.log(`Error: Failed to decrypt value ${orig}. Maybe you already decrypted it. Returning original value.`);
            return orig;
        }
    }
    public Endpoint(name?: string): EndpointService {
        return this.parseService("endpoint", name);
    }
    public AzureBotService(name?: string): AzureBotService {
        return this.parseService("abs", name);
    }
    public LUIS(name?: string): LUISService {
        return this.parseService("luis", name);
    }
    public QnAMaker(name?: string): QnAMakerService {
        return this.parseService("qna", name);
    }
    public Dispatch(name?: string): DispatchService {
        return this.parseService("dispatch", name);
    }
}
