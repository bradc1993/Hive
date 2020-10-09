
class UsersOnlineChannel < ApplicationCable::Channel
    # onlineUsers = [];

    def subscribed
      # stream_from "some_channel"
      stream_from 'users_online_channel'
      # usernames = User.all_online
      # ActionCable.server.broadcast('users_online_channel', username: usernames)
      UsersOnlineChannel.all_users(User.all.where(online: true))
    end
  
    def unsubscribed
      # Any cleanup needed when channel is unsubscribed
    end
  
    def user_join(data)
      # puts data
      user = User.find_by(username: data['username'])
      usernames = User.all
      # online_users = usernames.select {|user| user['online'] == true }
      ActionCable.server.broadcast('users_online_channel', username: usernames, new_user: user.username)
    end
  
    def user_leave(data)
      user = User.find_by(username: data['username'])
      # User.destroy(user.id)
      usernames = User.all
      # online_users = usernames.select {|user| user['online'] == true }
      ActionCable.server.broadcast('users_online_channel', username: usernames, bye_user: user)
    end

    def self.all_users(users)
      ActionCable.server.broadcast('users_online_channel', history: users)
    end
  end