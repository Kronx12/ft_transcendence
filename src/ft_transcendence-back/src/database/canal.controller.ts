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
        return this.CanalServ.getAllCanals();
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

    // /canal/non_admin/:id
    @Get('/non_admin/:id')
    async getNonAdminUserIds(@Headers('authorization') auth, @Param('id') id) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err)
                resp = { error: '401 Unauthorized' };
            else
                resp = await self.CanalServ.getNonAdminUser(id);
        });
        return resp;
    }

    // /canal/add_admin/
    @Post('/add_admin/')
    async addAdminUserId(@Headers('authorization') auth, @Body() body) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err)
                resp = { error: '401 Unauthorized' };
            else
                resp = self.CanalServ.addAdminUserId(body.canal_id, body.id);
        });
        return resp;
    }

    // /canal/add_user/
    @Post('/add_user/')
    async addUserId(@Headers('authorization') auth, @Body() body) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err)
                resp = { error: '401 Unauthorized' };
            else
                resp = self.CanalServ.addUserId(body.canal_id, body.id);
        });
        return resp;
    }

    // /canal/del_admin/
    @Post('/del_admin/')
    async delAdminUserId(@Headers('authorization') auth, @Body() body) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err)
                resp = { error: '401 Unauthorized' };
            else
                resp = self.CanalServ.delAdminUserId(body.canal_id, body.id);
        });
        return resp;
    }

    // /canal/del_user/
    @Post('/del_user/')
    async delUserId(@Headers('authorization') auth, @Body() body) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err)
                resp = { error: '401 Unauthorized' };
            else
                resp = self.CanalServ.delUserId(body.canal_id, body.id);
        });
        return resp;
    }

    // /login/:canal_id
    @Post('/login/:canal_id')
    async login(@Headers('authorization') auth, @Param('canal_id') canal_id, @Body() body) {
        const self = this;
        let resp;
        await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
            if (err)
                resp = { error: '401 Unauthorized' };
            else
                resp = self.CanalServ.login(canal_id, body);
        });
        return resp;
    }
}