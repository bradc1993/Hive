class ChatMessagesChannel < ApplicationCable::Channel
    # Communications from the frontend are received and handled here

    def subscribed
        stream_from 'chat_messages_channel'
        ChatMessagesChannel.all_messages(Message.all.order(id: :desc).limit(25).reorder(id: :asc))
    end

    def unsubscribed
        # Any cleanup needed when channel is unsubscribed
    end

    def send_text(data)
        Message.create(content: data['content'], username: data['username'], user_id: data['user_id'], channel_id: data['channel_id'])

        ActionCable.server.broadcast('chat_messages_channel',
        content: data['content'],
        username: data['username'],
        user_id: data['user_id'],
        channel_id: data['channel_id']
        )
    end

    def self.all_messages(messages)
        ActionCable.server.broadcast('chat_messages_channel', history: messages)
    end
end