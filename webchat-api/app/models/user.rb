class User < ApplicationRecord
    has_many :messages
    has_many :channels, -> { distinct }, through: :messages 

    validates :username, presence: true, uniqueness: true

    def self.all_online
        users = User.all.where(online: true)
        return users
    end

end
