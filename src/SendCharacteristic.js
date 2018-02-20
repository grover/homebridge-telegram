'use strict';

const debug = require('debug')('Bot');
const inherits = require('util').inherits;
const clone = require('clone');

module.exports = {
  registerWith: function (hap) {

    const Characteristic = hap.Characteristic;


    Characteristic.SendCharacteristic = function (api, displayName, notifications, bot) {
      this.UUID = api.uuid.generate(displayName);
      Characteristic.call(this, displayName, this.UUID);

      const props = {
        format: Characteristic.Formats.BOOL,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY],
      };
      this.setProps(props);

      this.value = false;

      if (notifications instanceof Array) {
        // Old style configuration
        this._mode = undefined;
        this._randomize = true;
        this._notifications = notifications;
      }
      else {
        // New style configuration
        this._mode = notifications.mode;
        this._randomize = notifications.hasOwnProperty('randomize') ? notifications.randomize : true;
        this._notifications = notifications.messages;
      }

      if (['Markdown', 'HTML', undefined].indexOf(this._mode) === -1) {
        throw new Error('Invalid notification configuration. Please check your configuration of homebridge-telegram.');
      }
      if (!(this._notifications instanceof Array) || this._notifications.length === 0) {
        throw new Error('Must specify at least one message for telegram notifications.');
      }

      this._activeNotifications = clone(this._notifications);
      this._notificationIndex = 0;


      this._bot = bot;

      this.on('set', this._onSet.bind(this));
    };
    inherits(Characteristic.SendCharacteristic, Characteristic);

    Characteristic.SendCharacteristic.prototype._onSet = function (value, callback) {

      const self = this;

      if (value) {
        this.pickMessage()
          .then(message => {
            return this._bot.send(message, this._mode);
          })
          .then(() => {
            callback();
          })
          .catch(e => {
            callback(e);
          })
          .then(() => {
            setTimeout(() => {
              debug('[%s] Reset the send telegram characteristic', this.displayName);
              self.updateValue(false);
            }, 1000);
          });
      }
      else {
        callback();
      }
    };

    Characteristic.SendCharacteristic.prototype.pickMessage = function () {
      return new Promise((resolve, reject) => {
        try {
          const notificationIndex = this.getMessageIndex();
          const notification = this._activeNotifications[notificationIndex];
          this._activeNotifications.splice(notificationIndex, 1);

          if (this._activeNotifications.length == 0) {
            this._activeNotifications = clone(this._notifications);
          }

          resolve(notification);
        }
        catch (e) {
          reject(e);
        }
      });
    };

    Characteristic.SendCharacteristic.prototype.getMessageIndex = function () {
      if (!this._randomize) {
        return 0;
      }

      return Math.floor(Math.random() * this._activeNotifications.length);
    };
  }
};
