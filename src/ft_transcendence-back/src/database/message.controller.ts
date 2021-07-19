import { Message } from '../entities/message.entity';
import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
    constructor(private readonly messageServ: MessageService) { }

    @Get()
    async findAllMessages() {
        return this.messageServ.findAllChats();
    }

    @Get('/:id')
    async findOneMessagePerID(@Param('id') id) {
        return this.messageServ.findOneMessagePerID(id);
    }

    @Delete(':id')
    async delete(@Param('id') id) {
        return this.messageServ.deleteMessage(id);
    }

    @Get('/search/:canalid')
    async findMessagesCanal(@Param('canalid') id)
    {
        return this.messageServ.findMessagesCanal(id);
    }

    @Post()
    addMessage(@Body() message: Message) {
        return this.messageServ.addMessage(message);
    }

    @Post('/add/:author/:message/:canalid')
    addNewMessage(@Param('author') author, @Param('message') message, @Param('canalid') id) {
        var mess: Message = {
            id: null,
            author: author,
            message: message,
            canalid: id
        };
        return this.messageServ.addMessage(mess);
    }
}