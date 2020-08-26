class ChannelsController < ApplicationController
    
    # READ

    def index
        channels = Channel.all
        render json: channels
    end

    def show
        channel = Channel.find(params[:id])
        render json: channel
    end

    #CREATE

    def new
    end

    def create
        channel = Channel.new(channel_params)

        if channel.save
            render json: channel, status: :created, location: channel
        else
            render json: channel.errors, status: :unprocessable_entity
        end
    end

    #UPDATE

    def edit
    end

    def update
    end

    #DESTROY

    def destroy
    end

    private

    def channel_params
        params.require(:channel).permit(:title)
    end

end
