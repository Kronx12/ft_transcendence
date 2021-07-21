import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import  { Games }  from '../entities/games.entity'

@Injectable()
export class GameDatabaseService {
    constructor(
        @InjectRepository(Games)
        private gamesRepo: Repository<Games>
    ) {}

    findAll(): Promise<Games[]> {
        return this.gamesRepo.find();
    }

    findOne(id: number): Promise<Games> {
        console.log(id)
        return this.gamesRepo.findOne({ where: `id = '${id}'` });
    }

    getId(id: string): Promise<Games> {
        return this.gamesRepo.findOne();
    }

    addGame(game: Games): Promise<Games[]> {
        console.log("Game receive : ")
        console.log(game)
        return this.gamesRepo.save([game]);
    }

    clearHistory(): Promise<DeleteResult> {
        return this.gamesRepo.query("DELETE FROM games;");
    }
}