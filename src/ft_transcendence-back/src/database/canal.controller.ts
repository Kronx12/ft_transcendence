import { Canal } from '../entities/canal.entity';
import { Controller, Get, Post, Delete, Param, Body, Patch, Headers } from '@nestjs/common';
import { CanalService } from './canal.service';
import { OffsetWithoutLimitNotSupportedError } from 'typeorm';
const jwt = require('jsonwebtoken');

@Controller('canal')
export class CanalController {
    constructor(private readonly CanalServ: CanalService) { }

    // /canal/
    @Get()
    async getAllCanals(@Headers('authorization') auth) {
        //const self = this;
        let resp;
        //await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
        //    if (err)
        //        resp = { error: '401 Unauthorized' };
        //    else
                resp = this.CanalServ.getAllCanals();
        //});
        return resp;
    }

    // /canal/:id
    @Get('/:id')
    async getCanalById(@Headers('authorization') auth, @Param('id') id) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err)
                resp = { error: '401 Unauthorized' };
            else
                resp = self.CanalServ.getCanalById(id);
        });
        return resp;
    }

    // /canal/search/:id
    @Get('/search/:id')
    async getCanalsByUserId(@Headers('authorization') auth, @Param('id') user) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err)
                resp = { error: '401 Unauthorized' };
            else
                resp = self.CanalServ.getCanalsByUserId(user);
        });
        return resp;
    }

    // /canal/:id
    @Delete('/:id')
    async deleteCanal(@Headers('authorization') auth, @Param('id') id) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err)
                resp = { error: '401 Unauthorized' };
            else
                resp = self.CanalServ.deleteCanalById(id);
        });
        return resp;
    }

    // /canal/ => with body
    @Post()
    async createCanal(@Headers('authorization') auth, @Body() canal: Canal) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err)
                resp = { error: '401 Unauthorized' };
            else
                resp = self.CanalServ.createCanal(canal);
        });
        return resp;
    }

    // /canal/ => with body
    @Patch()
    async updateCanal(@Headers('authorization') auth, @Body() canal: Canal) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err)
                resp = { error: '401 Unauthorized' };
            else
                resp = self.CanalServ.updataCanal(canal);
        });
        return resp;
    }
}