import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import  { Users }  from '../entities/users.entity'

@Injectable()
export class DatabaseService {
    constructor(
        @InjectRepository(Users)
        private usersRepo: Repository<Users>
    ) {}

    findAll(): Promise<Users[]> {
        return this.usersRepo.find();
    }

    findOne(intra_id: string): Promise<Users | undefined>{
        return this.usersRepo.findOne({ where: `intra_id = ${intra_id}`})
    }

    async create(newUser: Users) {
        await this.usersRepo.save(newUser)
        return this.findOne(String(newUser.intra_id));
    }

    async delete(id: string) {
        await this.usersRepo.delete(id)
        return {ok: true};
    }
    async editUser(id: string, content: any)
    {
        const self = this;
        let user;
        await this.findOne(id).then(function(edit) {
            user = edit;
        })
        if(content.avatar)
            user.avatar = content.avatar;
        if (content.username)
            user.username = content.username;
        console.log(user);
        this.usersRepo.update(user.id, user);
        console.log("ok")
        return {user};
    }

    async getGameHistory(id: number) {
        return (await this.usersRepo.findOne(id)).game_history;
    }

    async addGameToUser(id: number, gameid:number) {
        let user: Users;
        await this.usersRepo.findOne(id).then(function(edit) { user = edit; });
        let tmp = this.deserialize(user.game_history);
        if (gameid !== NaN)
            tmp.push(gameid);
        user.game_history = this.serialize(tmp);
        this.usersRepo.update(user.id, user);
    }

    serialize(lst: number[]): string {
        let res = "";
        lst.forEach(e => {
            if (e != NaN)
                res += e + ";";
        });
        res.slice(0, -1);
        return (res);
    }

    deserialize(str: string) : number[] {
        let res: number[] = [];
        str.split(";").forEach(e => {
            if (parseInt(e) != NaN)
            res.push(parseInt(e));
        });
        return (res);
    }
}  
