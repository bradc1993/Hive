class MessageSerializer < ActiveModel::Serializer
  attributes :id, :user, :channel_id, :content, :created_at
  has_one :user
  has_one :channel
end
