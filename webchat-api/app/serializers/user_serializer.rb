class UserSerializer < ActiveModel::Serializer
  attributes :id, :username, :online
  # :messages, :channels
  has_many :messages, serializer: MessageSerializer, include_nested_associations: true
  has_many :channels, serializer: ChannelSerializer
end
