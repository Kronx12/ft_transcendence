import { Controller, Get, Post, Delete, Param, Body, Patch } from '@nestjs/common';
import { Users } from 'src/entities/users.entity';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
    constructor(private readonly databaseServ: DatabaseService){}

    @Get("user")
    async findAll(){
        return this.databaseServ.findAll();
    }

    @Get("user/:intra")
    async findOne(@Param('intra') id)
    {
        return this.databaseServ.findOne(id);
    }

    @Post("user")
    async create(@Body() newUser: Users){
        return this.databaseServ.create(newUser);
    }

    @Delete("user/:id")
    async delete(@Param('id') id) {
        return this.databaseServ.delete(id);
    }

    @Patch('user/:id')
    async editUser(@Param('id') id, @Body() content)
    {
        return this.databaseServ.editUser(id, content);
    }
}
