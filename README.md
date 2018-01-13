# Homebridge Plugin for Telegram Bots

A platform that provides configurable [Telegram](https://telegram.org) Bots and integrates
them with HomeKit via [Homebridge](https://github.com/nfarina/homebridge).

__*UPGRADING FROM 0.0.7?*__

The configuration format and the exposed characteristics have changed. You will have to update your configuration, rules and scenes.

## Why a Telegram Bot?

This plugin enables you to send Telegram messages upon certain HomeKit events. The plugin provides
a toggle switch for groups of notifications, which will send out one of the predefined notifications via Telegram to a configured chat. For example, you
could set up a rule to send out a message via Telegram when a window is opened. And with [homebridge-automation-switches](https://github.com/grover/homebridge-automation-switches) you could even repeat that process until the window is closed.

You can also add a little fun to it, by providing many different messages in a group, which the plugin selects
randomly.

The bots are non-interactive, e.g. they do not provide commands to trigger things and will
not listen for messages sent to them.

## Changelog

All changes to homebridge-telegram are documented in the [changelog](CHANGELOG.md).

## Installation instructions

After [Homebridge](https://github.com/nfarina/homebridge) has been installed:

 ```sudo npm install -g homebridge-telegram```

## Example config.json:

 ```
{
  "bridge": {
      ...
  },
  "platforms": [
    {
      "platform": "Telegram",
      "bots": [
        {
          "name": "Bot name as seen in HomeKit",
          "token": "TELEGRAM BOT TOKEN",
          "chat": "TELEGRAM CHAT ID",
          "error": "Something broken. I'm shutting down.",
          "notifications": {
            "Hello": [
              "Hi!",
              "Hello!",
              "Hey mate!"
            ],
            "Bye": [
              "Good bye!",
              "I'm sad to see you leave."
            ]
          }
        }
      ]
    }
  ]
}
```

The platform can provide any number of bots that have to be predefined in the homebridge config.json. Each bot supports the following attributes:

| Attributes | Usage |
|------------|-------|
| name | A unique name for the bot. Will be used as the accessory name. |
| token | The Telegram Bot API token provided when you registered the bot. |
| chat | The chat ID used to send the notification to. |
| error | The message to send if something fails. If you do not want an error message visible in Telegram, keep this undefined. |
| notifications | An object providing notifications in named groups. |

A switch is created for each notification group.

## Creating a bot

The folks at Telegram created better [documentation](https://core.telegram.org/bots#6-botfather), than I could ever do.

Once you've created the bot you'll need to find a chat ID that this plugin should send messages to. The easiest
way is to message the bot and look for the JSON dumps in the homebridge log. This also supports group chats.

## Accessory Services

Each bot will expose two services:

* Accessory Information Service
* Bot Service

## BotService Characteristics

The exposed switch service supports the following characteristics:

| Characteristic | UUID | Permissions | Type | Usage |
|---|---|---|---|---|
| Quiet | `9799244D-7E74-471F-B672-C41C262F7337` | READ, WRITE | BOOL | Stops the bot from sending messages, while this is enabled. |

See [HomeKitTypes.js](src/HomeKitTypes.js) for details.

## Supported clients

This platform and the bots it drives have been verified to work with the following apps on iOS 11

* Elgato Eve

## Some asks for friendly gestures

If you use this and like it - please leave a note by staring this package here or on GitHub.

If you use it and have a
problem, file an issue at [GitHub](https://github.com/grover/homebridge-telegram/issues) - I'll try
to help.

If you tried this, but don't like it: tell me about it in an issue too. I'll try my best
to address these in my spare time.

If you fork this, go ahead - I'll accept pull requests for enhancements.

## License

MIT License

Copyright (c) 2017 Michael Fröhlich

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
