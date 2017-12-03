
# Homebridge Plugin for Telegram Bots

A platform that provides configurable [Telegram](https://telegram.org) Bots and integrates
them with HomeKit via [Homebridge](https://github.com/nfarina/homebridge).

## Why a Telegram Bot?

This plugin enables you to send Telegram messages upon certain HomeKit events. The plugin provides
a toggle switch, which will send out a message via Telegram to a configured chat. For example, you
could set up a rule to send out a message via Telegram when a window is opened. And with [homebridge-automation-switches](https://github.com/grover/homebridge-automation-switches) you could even repeat that process until the window is closed.

You can also add a little fun to it, by providing many different messages, which the plugin selects
randomly.

The bots are non-interactive, e.g. they do not provide commands to trigger things and will
not listen for messages sent to them.

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
            "0": [
              "Hi!",
              "Hello!",
              "Hey mate!"
            ],
            "1": [
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
| notifications | An object mapping urgency levels to an array of notification strings to send randomly when triggered. |

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
| Trigger | `BEDECDE6-3FD4-4C85-A7D4-DCB93837833B` | READ, WRITE, NOTIFY | BOOL | Sends a message via telegram. The message will be picked at random from the pool of messages depending on the urgency. Will automatically reset, once the message has been sent. If QuietMode is enabled, will behave as if a message was sent, but the sending will not happen. |
| Quiet | `9799244D-7E74-471F-B672-C41C262F7337` | READ, WRITE | BOOL | Stops the bot from sending messages, while this is enabled. |
| Urgency | `A867BE84-89DE-45C1-A974-2D39BD704232` | READ, WRITE | UINT32 | Determines the message set to pick from, when SendTelegram is triggered. The urgency ranges from 0 to 10. The plugin will not send a message if there are no messages for the urgency level and will go into a fatal failed state. |
| Failed | `505F2C13-69A4-4CC8-9F7E-420DA6672E5B` | READ, NOTIFY | BOOL | The bot has failed for some reason. |

See [HomeKitTypes.js](src/HomeKitTypes.js) for details.

## Supported clients

This platform and the bots it drives have been verified to work with the following apps on iOS 11

* Elgato Eve

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
