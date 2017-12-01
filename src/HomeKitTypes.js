"use strict";

const inherits = require('util').inherits;

module.exports = {
  registerWith: function (hap) {

    const Characteristic = hap.Characteristic;
    const Service = hap.Service;

    Characteristic.TelegramBotTrigger = function () {
      Characteristic.call(this, 'Trigger', 'BEDECDE6-3FD4-4C85-A7D4-DCB93837833B');

      this.setProps({
        format: Characteristic.Formats.BOOL,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY],
      });

      this.value = this.getDefaultValue();
    };
    inherits(Characteristic.TelegramBotTrigger, Characteristic);
    Characteristic.TelegramBotTrigger.UUID = 'BEDECDE6-3FD4-4C85-A7D4-DCB93837833B';


    Characteristic.TelegramBotQuiet = function () {
      Characteristic.call(this, 'Quiet', '9799244D-7E74-471F-B672-C41C262F7337');

      this.setProps({
        format: Characteristic.Formats.BOOL,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE],
      });

      this.value = this.getDefaultValue();
    };
    inherits(Characteristic.TelegramBotQuiet, Characteristic);
    Characteristic.TelegramBotQuiet.UUID = '9799244D-7E74-471F-B672-C41C262F7337';

    Characteristic.TelegramBotUrgency = function () {
      Characteristic.call(this, 'Urgency', 'A867BE84-89DE-45C1-A974-2D39BD704232');

      this.setProps({
        format: Characteristic.Formats.UINT32,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY],
        maxValue: 10,
        minValue: 0,
        minStep: 1,
        validValues: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      });

      this.value = this.getDefaultValue();
    };
    inherits(Characteristic.TelegramBotUrgency, Characteristic);
    Characteristic.TelegramBotUrgency.UUID = 'A867BE84-89DE-45C1-A974-2D39BD704232';

    Characteristic.TelegramBotFailed = function () {
      Characteristic.call(this, 'Failed', '505F2C13-69A4-4CC8-9F7E-420DA6672E5B');

      this.setProps({
        format: Characteristic.Formats.BOOL,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY],
      });

      this.value = this.getDefaultValue();
    };
    inherits(Characteristic.TelegramBotFailed, Characteristic);
    Characteristic.TelegramBotFailed.UUID = '505F2C13-69A4-4CC8-9F7E-420DA6672E5B';

    Service.TelegramBot = function (displayName, subtype) {
      Service.call(this, displayName, 'CA1172BF-8FB8-4F26-98E9-71EE92F7AF63', subtype);

      // Required Characteristics
      this.addCharacteristic(Characteristic.TelegramBotTrigger);
      this.addCharacteristic(Characteristic.TelegramBotQuiet);
      this.addCharacteristic(Characteristic.TelegramBotUrgency);
      this.addCharacteristic(Characteristic.TelegramBotFailed);

      // Optional Characteristics
      this.addOptionalCharacteristic(Characteristic.Name);
    };
    inherits(Service.TelegramBot, Service);
    Service.TelegramBot.UUID = 'CA1172BF-8FB8-4F26-98E9-71EE92F7AF63';
  }
}