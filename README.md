# BotBuilder Configuration Parser

Configuration helper for consuming and decrypting Microsoft Bot Framework bot files.

## Installation

To install:

    npm install botbuilder-config --save

## Usage

To instantiate the configuration:

    let c = new BotConfig("PATH_TO_BOT_FILE", "SECRET");

To access a bot service:

    let qna = c.QnAMaker(); //returns an object with all the properties of the QnA maker service in the bot file OR an array of QnA Maker services from the file, if there are more than one.
    qna.endpoint; //Access the "endpoint" property of the QnA Maker service.

### Services

Given the above instantiation, you can access each service (or an array of like services) by calling the method that matches the service:

* `c.Endpoint()`
* `c.AzureBotService()`
* `c.QnAMaker()`
* `c.LUIS()`
* `c.Dispatch()`

### Encryption

You could load and access the bot file by simply loading the bot file as JSON into your application. The advantage of this library is that it will decrypt your properties, if you have encrypted them with a secret.

    let c = new BotConfig("PATH_TO_BOT_FILE", "SECRET");
    let s = c.QnAMaker().subscriptionKey;
    console.log(s); //"s" will be decrypted;
