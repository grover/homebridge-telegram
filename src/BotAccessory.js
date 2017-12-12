"use strict";

const inherits = require('util').inherits;
const clone = require('clone');
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
    this._notificationsFromUrgency = 0;
    this._setActiveNotifications(this._notificationsFromUrgency);

    this._telegramBot = new BotFather(config.token);
    this._verifyBot();

    this._services = this.createServices();
  }

  _verifyBot() {

    this._botFailed = false;

    this._telegramBot.api('getMe')
      .then(json => {
        if (json.ok) {
          return json.result
        }

        this._reportBotFailure({
          failed: true,
          fatal: true
        });
      })
      .then(bot => {
        this.log(`I am @"${bot.username}", right? :)`);
        this._getBotUpdates();
      })
      .catch(exception => {
        this.log("Error: " + exception);
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

        this.log("getUpdates reported a failure: " + json.description);
        throw new Error("Telegram reported an error.");
      })
      .then(updates => {
        for (let update of updates) {
          this.log(JSON.stringify(update));
          if (update.message.chat) {
            this.log("Are you trying to invite me to a chat? Chat:" + JSON.stringify(update.message.chat));
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
        this.log("Failed to get updates." + exception)
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
    bot.getCharacteristic(Characteristic.TelegramBotTrigger)
      .on('set', this._send.bind(this));

    bot.getCharacteristic(Characteristic.TelegramBotQuiet)
      .on('set', this._setQuiet.bind(this))
      .on('get', this._getQuiet.bind(this));

    bot.getCharacteristic(Characteristic.TelegramBotUrgency)
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

    if (this._notifications.hasOwnProperty(urgency)) {
      this._urgency = urgency;
      this._setActiveNotifications(urgency);
      callback();
    }
    else {
      callback(new Error('Invalid value.'));
    }
  }

  _send(value, callback) {

    callback();
    setTimeout(() => {
      this.log('Reset the send telegram characteristic');
      this._services[1].getCharacteristic(Characteristic.TelegramBotTrigger)
        .updateValue(false, undefined, undefined);
    }, 1000);

    if (value && !this._quiet) {

      this.pickMessage().then(message => {
        return this._telegramBot.api('sendMessage', {
          chat_id: this._chat_id,
          text: message
        });
      }).then(() => {
        this.log('Message sent.');

        this._reportBotFailure({
          failed: false,
          fatal: false
        });
      }).catch((e) => {
        this.log('Send failed: ' + e);
        this._reportBotFailure({
          failed: true,
          fatal: false
        });
      });
    }
  }

  pickMessage() {
    const self = this;
    return new Promise((resolve, reject) => {
      try {
        const notificationIndex = Math.floor(Math.random() * self._activeNotifications.length);
        const notification = self._activeNotifications[notificationIndex];
        this._activeNotifications.splice(notificationIndex, 1);

        if (self._activeNotifications.length == 0) {
          self._setActiveNotifications(self._notificationsFromUrgency);
        }

        resolve(notification);
      }
      catch (e) {
        reject(e);
      }
    });
  }

  _setActiveNotifications(urgency) {
    if (typeof this._notifications[urgency] === "undefined") {
      return;
    }

    this._notificationsFromUrgency = urgency;
    this._activeNotifications = clone(this._notifications[this._notificationsFromUrgency]);
  }

  _reportBotFailure(options) {
    if (!this._botFailed) {
      this._services[1].getCharacteristic(Characteristic.TelegramBotFailed)
        .updateValue(options.failed, undefined, undefined);
      if (options.fatal) {

        this.log('The bot has failed fatally. Will try to reconnect in 5s.');
        this._botFailed = true;

        if (this._error) {
          this._telegramBot.api('sendMessage', {
            chat_id: this._chat_id,
            text: this._error
          }).catch(e => {
            this.log('Failed to send error notification to Telegram. Error: ' + e);
          });
        }

        setTimeout(this._verifyBot.bind(this), 5000);
      }
    }
  }
}

module.exports = BotAccessory;