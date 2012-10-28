module.exports = function(details) {
  var steam = new (require('steamkit'))(details.username, details.password);
  var irc = new (require('irc')).Client(details.server, details.nick, {
    channels: [details.channel]
  });
  
  steam.on('loggedOn', function() {
    steam.changeStatus(1);
    steam.joinChat(details.chatroom);
  });
  
  steam.on('chatMsg', function(chatter, chatRoom, msgType, message) {
    if (msgType == 1) { // ChatMsg
      irc.say(details.channel, '<' + steam.getFriendPersonaName(chatter) + '> ' + message);
    } else if (msgType == 4) { // Emote
      irc.say(details.channel, steam.getFriendPersonaName(chatter) + ' ' + message);
    }
  });
  
  irc.addListener('message' + details.channel, function(from, message) {
    steam.sendChatRoomMessage(details.chatroom, '<' + from + '> ' + message);
  });
  
  irc.addListener('action', function(from, to, message) {
    if (to == details.channel) {
      steam.sendChatRoomMessage(details.chatroom, from + ' ' + message);
    }
  });
};
