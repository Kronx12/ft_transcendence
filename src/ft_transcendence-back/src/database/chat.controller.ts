import { Chat } from '../entities/chat.entity';
import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { ChatService } from './chat.service';
import { OffsetWithoutLimitNotSupportedError } from 'typeorm';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatServ: ChatService) { }

    @Get()
    async findAllChats() {
        return this.chatServ.findAllChats();
    }

    @Get('/:id')
    async findOneMessagePerID(@Param('id') id) {
        return this.chatServ.findOneMessagePerID(id);
    }

    @Delete('/:id')
    async delete(@Param('id') id) {
        return this.chatServ.deleteMessage(id);
    }

    @Get('/search/:user')
    async findAllChatsForOneUser(@Param('user') user)
    {
        return this.chatServ.findAllChatsForOneUser(user);
    }
    
    @Post()
    async addMessage(@Body() chat: Chat) {
        console.log(chat);
        return this.chatServ.addMessage(chat);
    }

    @Post('/add/:name/:users/:admins/:owner/:password/:image')
    async addMessageWithAllContent(@Param('name') name, @Param('users') users, @Param('admins') admins, 
                                   @Param('owner') owner, @Param('password') password, @Param('image') image) {
        var chat: Chat = {
            id: null,
            name: name,
            users: users,
            admins: admins,
            owner: owner,
            password: password,
            image: image
        };
        return this.chatServ.addMessage(chat);
    }
}