# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

User.destroy_all
Channel.destroy_all
Message.destroy_all

# must run rails db:drop:all and re-migrate/seed

User.create!(username: "Brad") #1
User.create!(username: "Michael") #2
User.create!(username: "Steven") #3
User.create!(username: "Antonio") #4

Channel.create!(title: "Flatiron") #1
Channel.create!(title: "Off Topic") #2
Channel.create!(title: "Austin") #3
Channel.create!(title: "Houston") #4

Message.create!(content: "this is hard", username: "Brad", user_id: 1, channel_id: 1)
Message.create!(content: "brad sucks at coding lol", username: "Steven", user_id: 3, channel_id: 1)
Message.create!(content: "WOW great job on your mod 3  project!", username: "Steven", user_id: 3, channel_id: 3)
Message.create!(content: "this is the best project i have ever seen", username: "Antonio", user_id: 4, channel_id: 3)
Message.create!(content: "congratulations", username: "Steven", user_id: 3, channel_id: 3)
Message.create!(content: "yoooooo", username: "Brad", user_id: 1, channel_id: 2)
Message.create!(content: "sup", username: "Michael", user_id: 2, channel_id: 2)
Message.create!(content: "wuz good", username: "Brad", user_id: 1, channel_id:2)
Message.create!(content: "hello!", username: "Michael", user_id: 2, channel_id: 4)
Message.create!(content: "wyd", username: "Brad", user_id: 1, channel_id: 4)

