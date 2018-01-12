const version = require('../package.json').version;
const BotAccessory = require('./BotAccessory');

const HomeKitTypes = require('./HomeKitTypes');
const SendCharacteristic = require('./SendCharacteristic');

const HOMEBRIDGE = {
  Accessory: null,
  Service: null,
  Characteristic: null,
  UUIDGen: null
};

const platformName = 'homebridge-telegram';
const platformPrettyName = 'Telegram';

module.exports = (homebridge) => {
  HOMEBRIDGE.Accessory = homebridge.platformAccessory;
  HOMEBRIDGE.Service = homebridge.hap.Service;
  HOMEBRIDGE.Characteristic = homebridge.hap.Characteristic;
  HOMEBRIDGE.UUIDGen = homebridge.hap.uuid;

  homebridge.registerPlatform(platformName, platformPrettyName, TelegramPlatform, true);
}

const TelegramPlatform = class {
  constructor(log, config, api) {
    this.log = log;
    this.log('TelegramPlatform Plugin Loaded');
    this.config = config;
    this.api = api;


    HomeKitTypes.registerWith(api.hap);
    SendCharacteristic.registerWith(api.hap);
  }

  accessories(callback) {
    let _accessories = [];
    const { bots } = this.config;

    bots.forEach(bot => {
      this.log(`Found bot in config: "${bot.name}"`);

      const botAccessory = new BotAccessory(this.api.hap, this.log, bot);
      _accessories.push(botAccessory);
    });

    callback(_accessories);
  }
}