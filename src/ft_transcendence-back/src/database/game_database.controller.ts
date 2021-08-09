import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Games } from 'src/entities/games.entity';
import { GameDatabaseService } from './game_database.service';

@Controller('game_database')
export class GameDatabaseController {
    constructor(private readonly databaseServ: GameDatabaseService){}

    @Get()
    async findAll() {
        return this.databaseServ.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.databaseServ.findOne(+id);
    }

    @Get('/getid/:uuid')
    async getId(@Param('uuid') id: string) {
        return this.databaseServ.getId(id);
    }

    @Post()
    async addGame(@Body() game: Games) {
        return this.databaseServ.addGame(game);
    }

    @Delete()
    async clearHistory() {
        return this.databaseServ.clearHistory();
    }
}
