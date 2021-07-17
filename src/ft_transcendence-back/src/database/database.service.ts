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
    if (user != undefined) return user;

    let users;
    await this.findByMatch(name).then(function (found) {
      users = found;
    });
    if (users != undefined) return users;
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
    if (user === undefined)
      return;
    if (content.hasOwnProperty('avatar')) user.avatar = content.avatar;
    if (content.hasOwnProperty('username')) user.username = content.username;
    if (content.hasOwnProperty('status')) user.status = content.status;
    if (content.hasOwnProperty('friends')) user.friends = content.friends;
    if (content.hasOwnProperty('asked')) user.asked = content.asked;
    if (content.hasOwnProperty('auth')) user.auth = content.auth;
    if (content.hasOwnProperty('friends_request'))
      user.friends_request = content.friends_request;

    console.log("edit user ! ", content);
    this.usersRepo.update(user.id, user);
    return { user };
  }

  async requestFriend(from: string, to: string) {
    let user_from;
    await this.findOne(from).then(function (found) {
      user_from = found;
    });

    let user_to;
    await this.findOne(to).then(function (found) {
      user_to = found;
    });

    const check = user_to.friends_request.split(':');
    for (var i = 0; i < check.length; i++)
      if (check[i] === from)
        return { to: user_to.friends_request, from: user_from.asked };

    if (user_to.friends_request == '')
      user_to.friends_request = user_from.intra_id;
    else user_to.friends_request += `:${user_from.intra_id}`;

    this.usersRepo.update(user_to.id, user_to);

    if (user_from.asked == '') user_from.asked = user_to.intra_id;
    else user_from.asked += `:${user_to.intra_id}`;

    this.usersRepo.update(user_from.id, user_from);

    return { to: user_to.friends_request, from: user_from.asked };
  }

  async removeFriend(id: string, remove: string, second: number) {
    let user;
    await this.findOne(id).then(function (found) {
      user = found;
    });
    let friends = user.friends.split(':');
    if (friends.length == 0) return;
    for (var i = 0; i < friends.length; i++) {
      if (friends[i] === remove) {
        friends.splice(i, 1);
      }
    }
    let new_req = '';
    if (friends.length == 0) new_req = '';
    else if (friends.length == 1) new_req = friends[0];
    else {
      for (let str in friends) new_req += `${str}:`;
      new_req = new_req.slice(0, -1);
    }
    user.friends = new_req;
    this.usersRepo.update(user.id, user);
    if (second == 0) this.removeFriend(remove, id, 1);
  }

  async acceptFriend(id: string, accept: string) {
    let user;
    await this.findOne(id).then(function (found) {
      user = found;
    });
    let user_asker;
    await this.findOne(accept).then(function (found) {
      user_asker = found;
    });
    let friends = user.friends_request.split(':');
    const rfriends = user.friends.split(':');
    for (var i = 0; i < rfriends.length; i++)
      if (rfriends[i] === accept)
        return { accept: user.friends, asked: user_asker.friends };
    for (var i = 0; i < friends.length; i++) {
      if (friends[i] === accept) {
        friends.splice(i, 1);
      }
    }
    let new_req = '';
    if (friends.length == 0) new_req = '';
    else if (friends.length == 1) new_req = friends[0];
    else {
      for (let str in friends) new_req += `${str}:`;
      new_req = new_req.slice(0, -1);
    }
    user.friends_request = new_req;

    if (user.friends == '') user.friends = accept;
    else user.friends += `:${accept}`;
    this.usersRepo.update(user.id, user);

    
    friends = user_asker.asked.split(':');
    for (var i = 0; i < friends.length; i++) {
      if (friends[i] === id) {
        friends.splice(i, 1);
      }
    }
    new_req = '';

    if (friends.length == 0) new_req = '';
    else if (friends.length == 1) new_req = friends[0];
    else {
      for (let str in friends) new_req += `${str}:`;
      new_req = new_req.slice(0, -1);
    }

    user_asker.asked = new_req;

    if (user_asker.friends == '') user_asker.friends = id;
    else user_asker.friends += `:${id}`;
    this.usersRepo.update(user_asker.id, user_asker);

    return { accept: user.friends, asked: user_asker.friends };
  }

  async refuseFriend(id: string, refuse: string) {
    let user;
    await this.findOne(id).then(function (found) {
      user = found;
    });
    let friends = user.friends_request.split(':');

    for (var i = 0; i < friends.length; i++) {
      if (friends[i] === refuse) {
        friends.splice(i, 1);
      }
    }
    let new_req = '';
    if (friends.length == 0) new_req = '';
    else if (friends.length == 1) new_req = friends[0];
    else {
      for (let str in friends) new_req += `${str}:`;
      new_req = new_req.slice(0, -1);
    }
    user.friends_request = new_req;
    this.usersRepo.update(user.id, user);

    let user_asker;
    await this.findOne(refuse).then(function (found) {
      user_asker = found;
    });
    friends = user_asker.asked.split(':');
    for (var i = 0; i < friends.length; i++) {
      if (friends[i] === id) {
        friends.splice(i, 1);
      }
    }
    new_req = '';

    if (friends.length == 0) new_req = '';
    else if (friends.length == 1) new_req = friends[0];
    else {
      for (let str in friends) new_req += `${str}:`;
      new_req = new_req.slice(0, -1);
    }

    user_asker.asked = new_req;
    this.usersRepo.update(user_asker.id, user_asker);

    return { accept: user.friends_request, asked: user_asker.friends_request };
  }

  async getFriends(id: string) {
    let client;
    await this.findOne(id).then(function (found) {
      client = found;
    });
    if (client == undefined)
      return;
    return {
      friends: client.friends,
      request: client.friends_request,
      asked: client.asked,
    };
  }

  async getGameHistory(id: number) {
      return (await this.usersRepo.findOne(id)).game_history;
  }

  async addGameToUser(id: number, gameid: number) {
      let user: Users;
      await this.usersRepo.findOne({ where: `intra_id = '${id}'` }).then(function (edit) { user = edit; });
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

  deserialize(str: string): number[] {
      let res: number[] = [];
      str.split(";").forEach(e => {
          if (e != "" && e != "NaN" && parseInt(e) != NaN)
              res.push(parseInt(e));
      });
      return (res);
  }
}
