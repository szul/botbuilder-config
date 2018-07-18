import * as crypto from "crypto";

/**
 * @module botbuilder-config
 */

export interface IBotConfiguration {
    name?: string
    , description?: string
    , secretKey?: string
    , services: IServiceBase[]
    , getService: (type: string, name?: string) => Service;
};

export interface IServiceBase {
    type: string
    , name?: string
    , id?: string
};

export interface IService extends IServiceBase {
    add: (name: string, value: string) => boolean
    , remove: (name: string) => boolean
    , decrypt: (value: string, secret: string) => string
};

export interface IEndpointService extends IService {
    appId?: string
    , appPassword?: string
};

export interface IAzureBotService extends IService {
    tenantId?: string
    , resourceGroup?: string
    , subscriptionId?: string
    , endpoint?: string
    , appId?: string
    , appPassword?: string
};

export interface ILUISService extends IService {
    appId?: string
    , version?: string
    , authoringKey?: string
    , subscriptionKey?: string
    , endpointBasePath?: string
};

export interface IQnAMakerService extends IService {
    subscriptionKey?: string
    , endpointKey?: string
    , kbId?: string
    , hostname?: string
};

export interface IDispatchService extends ILUISService {
};

export class Service implements IService {
    public type: string;
    public name: string;
    public id: string;
    constructor(props?: any) {
        for(let k in props) {
            if(props.hasOwnProperty(k)) {
                this[k] = props[k];
            }
        }
    }
    public add(name: string, value: string): boolean {
        try {
            this[name] = value;
            return true;
        }
        catch(e) {
            return false;
        }
    }
    public remove(name: string): boolean {
        try {
            this[name] = undefined;
            return true;
        }
        catch(e) {
            return false;
        }
    }
    public decrypt(value: string, secret: string): string {
        //Decryption values sourced from Microsoft's MSBot CLI source code. If this breaks, look there to see if values have changed.
        try {
            const decipher = crypto.createDecipher("aes192", secret);
            let prop = decipher.update(value, "hex", "utf8");
            prop += decipher.final("utf8");
            return prop;
        }
        catch(e) {
            console.log(`Error: Decryption for ${value} failed.`);
        }
    }
}
