import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
    constructor(private readonly databaseServ: DatabaseService){}

    @Get()
    async findAll(){
        return this.databaseServ.findAll();
    }
}
