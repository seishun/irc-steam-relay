var Steam = require('steamkit');

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
      steam.sendChatRoomMessage(details.chatroom, '<' + from + '> ' + message);
    });
    
    irc.on('action', function(from, to, message) {
      if (to == details.channel) {
        steam.sendChatRoomMessage(details.chatroom, from + ' ' + message);
      }
    });
    
    irc.on('join' + details.channel, function(nick) {
      steam.sendChatRoomMessage(details.chatroom, nick + ' has joined ' + details.channel);
    });
    
    irc.on('part' + details.channel,  function(nick) {
      steam.sendChatRoomMessage(details.chatroom, nick + ' has left ' + details.channel);
    });
    
    irc.on('quit',  function(nick, reason) {
      steam.sendChatRoomMessage(details.chatroom, nick + ' has quit (' + reason + ')');
    });  
  });
  
  steam.on('chatMsg', function(chatter, message, chatRoom, msgType) {
    if (msgType == Steam.EChatEntryType.ChatMsg) {
      irc.say(details.channel, '<' + steam.getFriendPersonaName(chatter) + '> ' + message);
    } else if (msgType == Steam.EChatEntryType.Emote) {
      irc.say(details.channel, steam.getFriendPersonaName(chatter) + ' ' + message);
    }
  });
  
  steam.on('entered', function(chatter) {
    irc.say(details.channel, steam.getFriendPersonaName(chatter) + ' entered chat.');
  });
  
  steam.on('left', function(chatter) {
    irc.say(details.channel, steam.getFriendPersonaName(chatter) + ' left chat.');
  });
  
  steam.on('disconnected', function(chatter) {
    irc.say(details.channel, steam.getFriendPersonaName(chatter) + ' disconnected.');
  });
  
  steam.on('kicked', function(kickee, chat, kicker) {
    irc.say(details.channel, steam.getFriendPersonaName(kickee) + ' was kicked by ' + steam.getFriendPersonaName(kicker));
  });
    
  steam.on('banned', function(bannee, chat, banner) {
    irc.say(details.channel, steam.getFriendPersonaName(bannee) + ' was banned by ' + steam.getFriendPersonaName(banner));
  });
  
  steam.on('loggedOff', function(result) {
    console.log("Logged off:", result);
  });
  
  steam.on('debug', console.log);
};
