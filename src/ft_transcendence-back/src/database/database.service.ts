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
    
    async requestFriend(from: string, to: string)
    {
        let user_from;
        await this.findOne(from).then(function (found) {
          user_from = found;
        });

        let user_to;
        await this.findOne(to).then(function (found) {
            user_to = found;
        });

        if (user_to.friends_request == "")
            user_to.friends_request = user_from.intra_id
        else
            user_to.friends_request += `:${user_from.intra_id}`;
        
        this.usersRepo.update(user_to.id, user_to);

        if (user_from.asked == '')
          user_from.asked = user_to.intra_id;
        else user_from.asked += `:${user_to.intra_id}`;

        this.usersRepo.update(user_from.id, user_from);

        return { to: user_to.friends_request, from: user_from.asked };
    }

    async acceptFriend(id: string, accept: string) {
         let user;
         await this.findOne(id).then(function (found) {
           user = found;
         });
        let friends = user.friends_request.split(':')
 

        for (var i = 0; i < friends.length; i++) {
    
            if (friends[i] === accept) {
    
                friends.splice(i, 1);
            }
        }
        let new_req = "";
        if (friends.length == 0)
            new_req = '';
        else if (friends.length == 1)
            new_req = friends[0];
        else {
            for (let str in friends)
                new_req += `${str}:`;
          new_req = new_req.slice(0, -1);
        }
        user.friends_request = new_req;

        if (user.friends == "")
            user.friends = accept;
        else
            user.friends += `:${accept}`
        this.usersRepo.update(user.id, user);


        let user_asker;
        await this.findOne(accept).then(function (found) {
        user_asker = found;
        });
        friends = user_asker.asked.split(':');
        for (var i = 0; i < friends.length; i++) {
    
            if (friends[i] === id) {
    
                friends.splice(i, 1);
            }
        }
        new_req = '';

        if (friends.length == 0)
            new_req = ""
        else if (friends.length == 1)
            new_req = friends[0];
        else
        {
            for (let str in friends)
                new_req += `${str}:`;
            new_req = new_req.slice(0, -1);
        }
        
        user_asker.asked = new_req;

        if (user_asker.friends == '')
            user_asker.friends = id;
        else
            user_asker.friends += `:${id}`;
        this.usersRepo.update(user_asker.id, user_asker);

        return {accept: user.friends, asked: user_asker.friends}
    }
}
