"use strict";

const inherits = require('util').inherits;
const clone = require('clone');

const Bot = require('./Bot');
const SendCharacteristic = require('./SendCharacteristic');

var Characteristic, Service;


class BotAccessory {

  constructor(homebridge, log, config) {
    Characteristic = homebridge.Characteristic;
    Service = homebridge.Service;

    this.log = log;
    this.name = config.name;
    this.version = config.version;
    this.api = homebridge;

    this._notifications = config.notifications;

    this._bot = new Bot(this.name, config.token, config.chat, config.error);
    this._bot.on('connected', this._onBotConnected.bind(this));
    this._bot.on('failed', this._onBotFailed.bind(this));
    this._bot.connect();

    this._services = this.createServices();
  }

  getServices() {
    return this._services;
  }

  createServices() {
    return [
      this.getAccessoryInformationService(),
      this.getBridgingStateService(),
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

  getBridgingStateService() {
    this._bridgingStateService = new Service.BridgingState();
    this._bridgingStateService
      .setCharacteristic(Characteristic.Reachable, false)
      .setCharacteristic(Characteristic.LinkQuality, 4)
      .setCharacteristic(Characteristic.AccessoryIdentifier, this.name)
      .setCharacteristic(Characteristic.Category, this.api.Accessory.Categories.OTHER);

    return this._bridgingStateService;
  }

  getBotService() {
    this._botService = new Service.TelegramBot(this.name);

    this._botService.getCharacteristic(Characteristic.TelegramBotQuiet)
      .on('set', this._setQuiet.bind(this))
      .on('get', this._getQuiet.bind(this));


    for (const name of Object.keys(this._notifications)) {
      const c = new Characteristic.SendCharacteristic(this.api, name, this._notifications[name], this._bot);
      this._botService.addCharacteristic(c);
    }

    return this._botService;
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

  _onBotConnected() {
    this._setReachable(true);
  }

  _onBotFailed() {
    this._setReachable(false);
    setTimeout(() => {
      this._bot.connect();
    }, 1000);
  }

  _setReachable(reachable) {
    this._bridgingStateService
      .getCharacteristic(Characteristic.Reachable)
      .updateValue(reachable);

    this._botService
      .getCharacteristic(Characteristic.TelegramBotFailed)
      .updateValue(!reachable);
  }
}

module.exports = BotAccessory;