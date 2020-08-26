class CreateUsers < ActiveRecord::Migration[6.0]
  def change
    create_table :users do |t|
      t.string :username
      t.boolean :online, :default => false

      t.timestamps
    end
  end
end
