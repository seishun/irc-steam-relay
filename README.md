irc-steam-relay
===============

Relays messages between a Steam chat room and an IRC channel using [node-irc](https://github.com/martynsmith/node-irc) and [node-steam](https://github.com/seishun/node-steam).

Installation
-------------

    npm install git://github.com/seishun/irc-steam-relay.git

Usage
-----

    var relay = require('irc-steam-relay');
    relay({
      username: /* your Steam account name */,
      password: /* your Steam account password */,
      authCode: /* Steam Guard authentication code. Important: remove this line after the first successful logon */,
      chatroom: /* the 64-bit SteamID of the group as a decimal string - go to the group's page, press Ctrl+U and search for "joinchat" */,
      server: /* IRC server to connect to */,
      nick: /* nickname to use on IRC */,
      channel: /* IRC channel to spam on */,
      
      msgFormat: /* how to format messages from Steam on IRC, for example '<%s> %s'. Defaults to '\u000302%s\u000f: %s' (blue nick) */,
      msgFormatGame: /* same as above, but for in-game users. Defaults to msgFormat if provided, otherwise '\u000303%s\u000f: %s' (green nick) */,
      emoteFormat: /* same as msgFormat, but for emote messages (/me foo). Defaults to '\u000302%s %s' (all blue) */,
      emoteFormatGame: /* same as above, for for in-game users. Defaults to emoteFormat if provided, otherwise '\u000303%s %s' (all green) */ 
    });

There's no API, just a function that does everything.

You can use '.k', '.kb' and '.unban' commands to kick, (kick)ban and unban across Steam and IRC. The command won't trigger if the user doesn't have ops (for IRC->Steam) or the appropriate chat room permission (for Steam->IRC).

Use '.userlist' in either Steam or IRC to get a list of users on the other side.
