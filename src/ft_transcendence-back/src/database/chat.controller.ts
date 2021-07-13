import { Chat } from '../entities/chat.entity';
import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
    constructor(private readonly chatServ: ChatService) { }

    @Get()
    async findAllMessages() {
        return this.chatServ.findAllMessages();
    }

    @Get('/search/:author')
    async findOneMessage(@Param('author') author) {
        return this.chatServ.findOneMessage(author);
    }

    @Get('/:id')
    async findOneMessagePerID(@Param('id') id) {
        return this.chatServ.findOneMessagePerID(id);
    }

    @Delete(':id')
    async delete(@Param('id') id) {
        return this.chatServ.deleteMessage(id);
    }

    @Post()
    async addMessage(@Body() chat: Chat) {
        console.log(chat);
        return this.chatServ.addMessage(chat);
    }

    // @Post('/:author/:message/:canal')
    // async addMessage(@Param('author') author, @Param('message') message, @Param('canal') canal)
    // {
    //     var chat : Chat = {
    //         id: null,
    //         author: author,
    //         message: message,
    //         canalid: canal
    //     };
    //     return this.chatServ.addMessage(chat);
    // }
}