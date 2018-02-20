'use strict';

const inherits = require('util').inherits;

module.exports = {
  registerWith: function (hap) {

    const Characteristic = hap.Characteristic;
    const Service = hap.Service;

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

    Service.TelegramBot = function (displayName, subtype) {
      Service.call(this, displayName, 'CA1172BF-8FB8-4F26-98E9-71EE92F7AF63', subtype);

      // Required Characteristics
      this.addCharacteristic(Characteristic.TelegramBotQuiet);

      // Optional Characteristics
      this.addOptionalCharacteristic(Characteristic.Name);
    };
    inherits(Service.TelegramBot, Service);
    Service.TelegramBot.UUID = 'CA1172BF-8FB8-4F26-98E9-71EE92F7AF63';
  }
};