import { Message } from '../entities/message.entity';
import { Controller, Get, Post, Delete, Param, Body, Patch, Headers } from '@nestjs/common';
import { MessageService } from './message.service';
const jwt = require('jsonwebtoken');

@Controller('message')
export class MessageController {
    constructor(private readonly messageServ: MessageService) { }

    // /message/
    @Get()
    async getAllMessages(@Headers('authorization') auth) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err || decoded.provider == undefined || decoded.id == undefined || decoded.provider != "store")
                resp = { error: '401 Unauthorized' };
            else
                resp = self.messageServ.getAllMessages();
        });
        return resp;
    }

    // /message/:id
    @Get('/:id')
    async getMessagesByCanalId(@Headers('authorization') auth, @Param('id') id) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err || decoded.provider == undefined || decoded.id == undefined || decoded.provider != "store")
                resp = { error: '401 Unauthorized' };
            else
                resp = self.messageServ.getMessagesByCanalId(id);
        });
        return resp;
    }

    // /message/ => with body
    @Post('/:message/:author/:canalid')
    async createMessage(@Headers('authorization') auth, @Param('message') mess, @Param('author') author, @Param('canalid') canalid) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err || decoded.provider == undefined || decoded.id == undefined || decoded.provider != "store")
                resp = { error: '401 Unauthorized' };
            else
                resp = self.messageServ.createMessage(mess, +author, +canalid);
        });
        return resp;
    }

   
}