/**
 * @module botbuilder-config
 */

export interface BotConfiguration {
    name?: string
    , description?: string
    , secretKey?: string
    , services: Service[]
};

export interface Service {
    type?: string
    , encryptionChecked?: boolean
    , name?: string
    , id?: string
};

export interface EndpointService extends Service {
    appId?: string
    , appPassword?: string
};

export interface AzureBotService extends Service {
    tenantId?: string
    , resourceGroup?: string
    , subscriptionId?: string
    , endpoint?: string
    , appId?: string
    , appPassword?: string
};

export interface LUISService extends Service {
    appId?: string
    , version?: string
    , authoringKey?: string
    , subscriptionKey?: string
    , endpointBasePath?: string
};

export interface QnAMakerService extends Service {
    subscriptionKey?: string
    , endpointKey?: string
    , kbId?: string
    , hostname?: string
};

export interface DispatchService extends LUISService {
};
