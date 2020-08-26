class Message < ApplicationRecord
  belongs_to :user
  belongs_to :channel

  validates :content, presence: true

  def created_at
    attributes['created_at'].strftime("%l:%M%P, %A")
  end
end
