
class UsersOnlineChannel < ApplicationCable::Channel
    # onlineUsers = [];

    def subscribed
      # stream_from "some_channel"
      stream_from 'users_online_channel'
      usernames = User.all_online
      ActionCable.server.broadcast('users_online_channel', username: usernames)
    end
  
    def unsubscribed
      # Any cleanup needed when channel is unsubscribed
    end
  
    def user_join(data)
      # puts data
      user = User.find_by(username: data['username'])
      usernames = User.all
      ActionCable.server.broadcast('users_online_channel', username: usernames, new_user: user.username)
    end
  
    def user_leave(data)
      user = User.find_by(username: data['username'])
      # User.destroy(user.id)
      usernames = User.all
      ActionCable.server.broadcast('users_online_channel', username: usernames, bye_user: user.username)
    end
  end