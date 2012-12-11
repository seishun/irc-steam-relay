var Steam = require('steam');

module.exports = function(details) {
  var irc = new (require('irc')).Client(details.server, details.nick, {
    channels: [details.channel]
  });
  
  var steam = new Steam.SteamClient();
  steam.logOn(details.username, details.password, details.authCode);
  
  steam.on('connected', function() {
    console.log('Connected!');
  });
  
  steam.on('loggedOn', function(result) {
    console.log('Logged on!');
    
    steam.setPersonaState(Steam.EPersonaState.Online);
    steam.joinChat(details.chatroom);
    
    irc.on('message' + details.channel, function(from, message) {
      steam.sendMessage(details.chatroom, '<' + from + '> ' + message);
      
      var parts = message.match(/(\S+)\s+(.*\S)/);
      if (!parts || ['.k', '.kb', '.unban'].indexOf(parts[1]) == -1)
        return;
      
      irc.whois(from, function(info) {
        if (info.channels.indexOf('@' + details.channel) == -1)
          return; // not OP, go away
        
        Object.keys(steam.users).filter(function(user) {
          return steam.users[user].playerName == parts[2];
        }).forEach(function(user) {
          steam[{
            '.k': 'kick',
            '.kb': 'ban',
            '.unban': 'unban'
          }[parts[1]]](details.chatroom, user);
        });
      });
    });
    
    irc.on('action', function(from, to, message) {
      if (to == details.channel) {
        steam.sendMessage(details.chatroom, from + ' ' + message);
      }
    });
    
    irc.on('+mode', function(channel, by, mode, argument, message) {
      if (channel == details.channel && mode == 'b') {
        steam.sendMessage(details.chatroom, by + ' sets ban on ' + argument);
      }
    });
    
    irc.on('-mode', function(channel, by, mode, argument, message) {
      if (channel == details.channel && mode == 'b') {
        steam.sendMessage(details.chatroom, by + ' removes ban on ' + argument);
      }
    });
    
    irc.on('kick' + details.channel, function(nick, by, reason, message) {
      steam.sendMessage(details.chatroom, by + ' has kicked ' + nick + ' from ' + details.channel + ' (' + reason + ')');
    });
    
    irc.on('join' + details.channel, function(nick) {
      steam.sendMessage(details.chatroom, nick + ' has joined ' + details.channel);
    });
    
    irc.on('part' + details.channel, function(nick) {
      steam.sendMessage(details.chatroom, nick + ' has left ' + details.channel);
    });
    
    irc.on('quit', function(nick, reason) {
      steam.sendMessage(details.chatroom, nick + ' has quit (' + reason + ')');
    });
  });
  
  steam.on('chatMsg', function(chatRoom, message, msgType, chatter) {
    var color = '\u0003' + (steam.users[chatter].gameName ? '03' : '02');
    var name = steam.users[chatter].playerName;
    if (msgType == Steam.EChatEntryType.ChatMsg) {
      irc.say(details.channel, color + name + '\u000f: ' + message);
    } else if (msgType == Steam.EChatEntryType.Emote) {
      irc.say(details.channel, color + name + ' ' + message);
    }
    
    var parts = message.split(/\s+/);
    var permissions = steam.chatRooms[chatRoom][chatter].permissions;
    
    if (parts[0] == '.k' && permissions & Steam.EChatPermission.Kick) {
      irc.send('KICK', details.channel, parts[1], 'requested by ' + name);
      
    } else if (parts[0] == '.kb' && permissions & Steam.EChatPermission.Ban) {
      irc.send('MODE', details.channel, '+b', parts[1]);
      irc.send('KICK', details.channel, parts[1], 'requested by ' + name);
      
    } else if (parts[0] == '.unban' && permissions & Steam.EChatPermission.Ban) {
      irc.send('MODE', details.channel, '-b', parts[1]);
    }
  });
  
  steam.on('chatStateChange', function(stateChange, chatterActedOn, chat, chatterActedBy) {
    var name = steam.users[chatterActedOn].playerName;
    switch (stateChange) {
      case Steam.EChatMemberStateChange.Entered:
        irc.say(details.channel, name + ' entered chat.');
        break;
      case Steam.EChatMemberStateChange.Left:
        irc.say(details.channel, name + ' left chat.');
        break;
      case Steam.EChatMemberStateChange.Disconnected:
        irc.say(details.channel, name + ' disconnected.');
        break;
      case Steam.EChatMemberStateChange.Kicked:
        irc.say(details.channel, name + ' was kicked by ' + steam.users[chatterActedBy].playerName + '.');
        break;
      case Steam.EChatMemberStateChange.Banned:
        irc.say(details.channel, name + ' was banned by ' + steam.users[chatterActedBy].playerName + '.');
    }
  });
  
  steam.on('loggedOff', function(result) {
    console.log("Logged off:", result);
  });
  
  steam.on('debug', console.log);
};
