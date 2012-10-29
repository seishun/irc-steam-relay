module.exports = function(details) {
  var steam = new (require('steamkit'))(details.username, details.password);
  var irc = new (require('irc')).Client(details.server, details.nick, {
    channels: [details.channel]
  });
  
  steam.on('loggedOn', function() {
    steam.changeStatus(1);
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
    if (msgType == 1) { // ChatMsg
      irc.say(details.channel, '<' + steam.getFriendPersonaName(chatter) + '> ' + message);
    } else if (msgType == 4) { // Emote
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
};
