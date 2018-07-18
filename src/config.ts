import { IBotConfiguration, Service, IServiceBase  } from "./service"
import { AzureBotService } from "./azurebotservice";
import { DispatchService } from "./dispatch";
import { EndpointService } from "./endpoint";
import { LUISService } from "./luis";
import { QnAMakerService } from "./qnamaker";
import * as fs from "fs";
import * as shelljs from "shelljs";
import * as path from "path";

/**
 * @module botbuilder-config
 */

export class BotConfig implements IBotConfiguration {
    private readonly _encryptedProperties = {
        endpoint: ["appPassword"],
        abs: ["appPassword"],
        luis: ["authoringKey", "subscriptionKey"],
        qna: ["subscriptionKey"],
        dispatch: ["authoringKey", "subscriptionKey"]
    }; //Encrypted properties sourced from Microsoft's MSBot CLI source code.
    public name: string;
    public description: string;
    public secretKey: string;
    public services: IServiceBase[];
    constructor(private readonly botFilePath?: string, private readonly secret?: string) {
        this.init();
    }
    private init(): BotConfig {
        const botFile = this.parseBotFile();
        for(let k in botFile) {
            if(botFile.hasOwnProperty(k)) {
                this[k] = botFile[k];
            }
        }
        return this;
    }
    private parseBotFile(): IBotConfiguration {
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
    private parse(botFile: string): IBotConfiguration {
        //Might need to account for other encodings.
        let f: string = fs.readFileSync(botFile, "utf-8");
        return <IBotConfiguration>JSON.parse(f);
    }
    private parseService(type: string, name?: string): Service {
        let services: IServiceBase[] = [];
        this.services.forEach((s: Service, idx: number) => {
            if(s.type === type && (name == null || s.name === name)) {
                services.push(s);
            }
        });
        if(services.length === 0) {
            if(name != null) {
                throw new Error(`Error: No services of type: ${type} and name: ${name} found in your bot file.`);
            }
            throw new Error(`Error: No services of type: ${type} found in your bot file.`);
        }
        return new Service(services[0]);
    }
    public getService(type: string, name?: string): Service {
        switch(type.toLowerCase()) {
            case "endpoint":
            case "abs":
            case "luis":
            case "qna":
            case "dispatch":
                this.parseService(type, name);
            default:
                throw new Error("Error: Invalid Bot Service [type] specified.");
        }
    }
    public Endpoint(name?: string): EndpointService {
        return <EndpointService>this.parseService("endpoint", name);
    }
    public AzureBotService(name?: string): AzureBotService {
        return <AzureBotService>this.parseService("abs", name);
    }
    public LUIS(name?: string): LUISService {
        return <LUISService>this.parseService("luis", name);
    }
    public QnAMaker(name?: string): QnAMakerService {
        return <QnAMakerService>this.parseService("qna", name);
    }
    public Dispatch(name?: string): DispatchService {
        return <DispatchService>this.parseService("dispatch", name);
    }
}
