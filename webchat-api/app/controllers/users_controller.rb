class UsersController < ApplicationController
   
    # READ

    def index
        users = User.all
        render json: users
    end

    def show
        user = User.find(params[:id])
        render json: user
    end

    #CREATE

    def new
    end

    def create
        user = User.new(user_params)

        if user.save
            render json: user, status: :created, location: user
        else
            render json: user.errors, status: :unprocessable_entity
        end
    end

    #UPDATE

    def update
        user = User.find(params[:id])
        if user.update(user_params)
            render json: user
          else
            render json: user.errors, status: :unprocessable_entity
          end
    end

    #DESTROY
    def destroy
    end

    private

    def user_params
        params.require(:user).permit(:username, :online)
    end
end
