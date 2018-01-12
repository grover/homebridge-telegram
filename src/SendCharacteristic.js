"use strict";

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

      this._activeNotifications = clone(notifications);
      this._notifications = notifications;
      this._bot = bot;

      this.on('set', this._onSet.bind(this));
    };
    inherits(Characteristic.SendCharacteristic, Characteristic);

    Characteristic.SendCharacteristic.prototype._onSet = function (value, callback) {

      const self = this;
      setTimeout(() => {
        debug('[%s] Reset the send telegram characteristic', this.displayName);
        self.updateValue(false);
      }, 1000);

      if (value && !this._quiet) {
        this.pickMessage()
          .then(message => {
            return this._bot.send(message);
          })
          .then(() => {
            callback();
          })
          .catch(e => {
            callback(e);
          });
      }
      else {
        callback();
      }
    };

    Characteristic.SendCharacteristic.prototype.pickMessage = function () {
      return new Promise((resolve, reject) => {
        try {
          const notificationIndex = Math.floor(Math.random() * this._activeNotifications.length);
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
    }
  }
};
