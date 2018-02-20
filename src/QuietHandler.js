'use strict';

class QuietHandler {
  constructor(bot) {
    this._bot = bot;
    this._quiet = false;
  }

  setQuiet(quiet) {
    this._quiet = quiet;
  }

  send(message, mode) {
    if (this._quiet === false) {
      this._bot.send(message, mode);
    }
  }
}

module.exports = QuietHandler;
