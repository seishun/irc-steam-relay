irc-steam-relay
===============

Relays messages between a Steam chat room and an IRC channel using [node-irc](https://github.com/martynsmith/node-irc) and [node-steam](https://github.com/seishun/node-steam).

Installation
-------------

    git clone git://github.com/seishun/irc-steam-relay.git

Usage
-----

    var relay = require('./irc-steam-relay');
    relay({
      username: /* your Steam account name */,
      password: /* your Steam account password */,
      chatroom: /* the 64-bit SteamID of the group as a decimal string - go to the group's page, press Ctrl+U and search for "joinchat" */,
      server: /* IRC server to connect to */,
      nick: /* nickname to use on IRC */,
      channel: /* IRC channel to spam on */
    });

There's no API, just a function that does everything.
