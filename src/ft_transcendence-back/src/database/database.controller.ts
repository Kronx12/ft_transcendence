import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { Users } from 'src/entities/users.entity';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseServ: DatabaseService) {}

  @Get('user')
  async findAll() {
    return this.databaseServ.findAll();
  }

  @Get('user/:intra')
  async findOne(@Param('intra') id) {
    return this.databaseServ.findOne(id);
  }

  @Get('user/search/:name')
  async searchUser(@Param('name') name) {
    return this.databaseServ.searchUser(name);
  }

  @Post('user')
  async create(@Body() newUser: Users) {
    return this.databaseServ.create(newUser);
  }

  @Post('ask/:from/:to')
  async askFriend(@Param('from') from, @Param('to') to) {
    return this.databaseServ.requestFriend(from, to);
  }

  @Post('accept/:id/:accept')
  async acceptFriend(@Param('id') id, @Param('accept') accept) {
    return this.databaseServ.acceptFriend(id, accept);
  }

  @Delete('user/:id')
  async delete(@Param('id') id) {
    return this.databaseServ.delete(id);
  }

  @Patch('user/:id')
  async editUser(@Param('id') id, @Body() content) {
    return this.databaseServ.editUser(id, content);
  }
}
