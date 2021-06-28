import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../entities/users.entity';

@Injectable()
export class DatabaseService {
  constructor(
    @InjectRepository(Users)
    private usersRepo: Repository<Users>,
  ) {}

  findAll(): Promise<Users[]> {
    return this.usersRepo.find();
  }

  findOne(intra_id: string): Promise<Users | undefined> {
    return this.usersRepo.findOne({ where: `intra_id = ${intra_id}` });
  }

  findByName(name: string): Promise<Users | undefined> {
    return this.usersRepo.findOne({ where: `username = '${name}'` });
  }

  findByMatch(match: string): Promise<Users[]> {
    return this.usersRepo.find({ where: `username LIKE '%${match}%'` });
  }

async searchUser(name: string): Promise<Users | Users[] | undefined> {
    let user;
    await this.findByName(name).then(function (found) {
        user = found;
    });
    if(user != undefined)
        return user;

    let users;
    await this.findByMatch(name).then(function (found) {
            users = found
    });
    if(users != undefined)
        return users;
    return undefined;
  }
  async create(newUser: Users) {
    await this.usersRepo.save(newUser);
    return this.findOne(String(newUser.intra_id));
  }

  async delete(id: string) {
    await this.usersRepo.delete(id);
    return { ok: true };
  }
  async editUser(id: string, content: any) {
    const self = this;
    let user;
    await this.findOne(id).then(function (edit) {
      user = edit;
    });
    if (content.avatar) user.avatar = content.avatar;
    if (content.username) user.username = content.username;
    if (content.hasOwnProperty('status')) user.status = content.status;
    this.usersRepo.update(user.id, user);
    return { user };
  }
}
