class MessagesController < ApplicationController
    before_action :set_message, only: [:show, :update, :destroy]

    ## READ

    def index
        messages = Message.all
        render json: messages
        # .to_json(include: [user: { only: [:name]}])
    end

    def show
        render json: message
    end

    ## CREATE

    def new
        messages = Message.all
        message = Message.new
    end

    # POST /messages
    def create
        message = Message.new(message_params)

        if message.save
            render json: message, status: :created, location: message
        else
            render json: message.errors, status: :unprocessable_entity
        end
    end

    ## UPDATE

    def edit
    end

    def update
    end

    ## DESTROY

    def destroy
    end

    private

    def set_message
        message = Message.find(params[:id])
    end

    def message_params
        params.require(:message).permit(:content, :username, :user_id, :channel_id)
    end

end
