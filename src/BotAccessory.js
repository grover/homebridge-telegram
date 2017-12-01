"use strict";

const inherits = require('util').inherits;
const BotFather = require('botfather');

var Accessory, Characteristic, Service;


class BotAccessory {

  constructor(homebridge, log, config) {
    Accessory = homebridge.Accessory;
    Characteristic = homebridge.Characteristic;
    Service = homebridge.Service;

    this.log = log;
    this.name = config.name;
    this.version = config.version;
    this.category = Accessory.Categories.SWITCH;

    this._chat_id = config.chat;
    this._notifications = config.notifications;
    this._error = config.error;
    this._urgency = 0;

    this._telegramBot = new BotFather(config.token);
    this._botFailed = false;

    this._verifyBot();

    this._services = this.createServices();
  }

  _verifyBot() {
    this._telegramBot.api('getMe')
      .then(json => {
        if (json.ok) {
          return json.result
        }

        console.error(json.description)
        this._reportBotFailure({
          failed: true,
          fatal: true
        });
      })
      .then(bot => {
        console.info('I am @%s, right? :)', bot.username);
        this._getBotUpdates();
      })
      .catch(exception => {
        console.error(exception);
        this._reportBotFailure({
          failed: true,
          fatal: true
        });
      });
  }

  _getBotUpdates() {
    const parameters = {
      limit: 100,
      timeout: 60 * 2
    };

    if (this._updateOffset) {
      parameters.offset = this._updateOffset;
    }

    this._telegramBot.api('getUpdates', parameters)
      .then(json => {
        if (json.ok) {
          return json.result;
        }

        console.error("getUpdates reported a failure: " + json.description);
        throw new Error("Telegram reported an error.");
      })
      .then(updates => {
        for (let update of updates) {
          console.log(JSON.stringify(update));
          if (update.message.chat) {
            console.info("Are you trying to invite me to a chat? Chat:" + JSON.stringify(update.message.chat));
          }
        }

        // offset = update_id of last processed update + 1 
        if (updates.length > 0) {
          const identifiers = updates.map((update) => update.update_id);
          this._updateOffset = Math.max.apply(Math, identifiers) + 1;
        }

        this._getBotUpdates();
      })
      .catch(exception => {
        console.error("Failed to get updates." + exception.stack)
        this._reportBotFailure({
          failed: true,
          fatal: true
        });
      });
  }

  getServices() {
    return this._services;
  }

  createServices() {
    return [
      this.getAccessoryInformationService(),
      this.getBotService()
    ];
  }

  getAccessoryInformationService() {
    return new Service.AccessoryInformation()
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, 'Michael Froehlich')
      .setCharacteristic(Characteristic.Model, 'Telegram Bot')
      .setCharacteristic(Characteristic.SerialNumber, '42')
      .setCharacteristic(Characteristic.FirmwareRevision, this.version)
      .setCharacteristic(Characteristic.HardwareRevision, this.version);
  }

  getBotService() {
    const bot = new Service.TelegramBot(this.name);
    bot.getCharacteristic(Characteristic.SendTelegram)
      .on('set', this._send.bind(this));

    bot.getCharacteristic(Characteristic.Quiet)
      .on('set', this._setQuiet.bind(this))
      .on('get', this._getQuiet.bind(this));

    bot.getCharacteristic(Characteristic.Urgency)
      .on('set', this._setUrgency.bind(this));

    return bot;
  }
  identify(callback) {
    this.log(`Identify requested on telegram bot ${this.name}`);
    callback();
  }

  _setQuiet(quiet, callback) {
    this.log("Setting bot quiet state to " + quiet);
    this._quiet = quiet;

    callback();
  }

  _getQuiet(callback) {
    this.log("Returning current bot quiet status: s=" + (this._timer !== undefined));
    callback(undefined, this._quiet);
  }

  _setUrgency(urgency, callback) {
    this.log("Setting bot urgency to " + urgency);
    this._urgency = urgency;

    callback();
  }

  _send(value, callback) {

    callback();
    setTimeout(() => {
      console.log('Reset the send telegram characteristic');
      this._services[1].getCharacteristic(Characteristic.SendTelegram)
        .updateValue(false, undefined, undefined);
    }, 1000);

    if (value && !this._quiet) {

      this.pickMessage().then(message => {
        return this._telegramBot.api('sendMessage', {
          chat_id: this._chat_id,
          text: message
        });
      }).then(() => {
        console.log('Message sent.');

        this._reportBotFailure({
          failed: false,
          fatal: false
        });
      }).catch((e) => {
        console.error('Send failed: ' + e);
        this._reportBotFailure({
          failed: true,
          fatal: false
        });
      });
    }
  }

  pickMessage() {
    return new Promise((resolve, reject) => {
      try {
        const notifications = this._notifications[this._urgency];
        const notificationIndex = Math.floor(Math.random() * notifications.length);
        resolve(notifications[notificationIndex]);
      }
      catch (e) {
        reject(e);
      }
    });
  }

  _reportBotFailure(options) {
    if (!this._botFailed) {
      this._services[1].getCharacteristic(Characteristic.BotFailed)
        .updateValue(options.failed, undefined, undefined);
      if (options.fatal) {
        console.error('The bot has failed fatally. Will not send any further messages or attempt to talk to Telegram.');
        this._botFailed = true;

        if (this._error) {
          this._telegramBot.api('sendMessage', {
            chat_id: this._chat_id,
            text: this._error
          }).catch(e => {
            console.error('Failed to send error notification to Telegram. Error: ' + e);
          });
        }
      }
    }
  }
}

module.exports = BotAccessory;