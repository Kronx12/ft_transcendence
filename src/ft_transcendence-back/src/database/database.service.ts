import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Any, Repository } from 'typeorm';
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
    let user;
    await this.findOne(String(newUser.intra_id)).then(function (found) {
      user = found;
    });
    if (user != undefined) return user;
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
    if (user === undefined) return;
	  if (content.hasOwnProperty('avatar')) user.avatar = content.avatar;
	  if (content.hasOwnProperty('canals')) user.canals = content.canals;
    if (content.hasOwnProperty('username')) user.username = content.username;
    if (content.hasOwnProperty('status')) user.status = content.status;
    if (content.hasOwnProperty('friends')) user.friends = content.friends;
    if (content.hasOwnProperty('asked')) user.asked = content.asked;
    if (content.hasOwnProperty('auth')) user.auth = content.auth;
    if (content.hasOwnProperty('friends_request'))
      user.friends_request = content.friends_request;
    if (content.hasOwnProperty('game_history'))
      user.game_history = content.game_history;

    //console.log('edit user ! ', content);
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
    if (client == undefined) return;
    return {
      friends: client.friends,
      request: client.friends_request,
      asked: client.asked,
    };
  }

  getCanalsOtherUsers(canalid: number) {
    //console.log('Canal id:');
    //console.log(canalid);
    return this.usersRepo.find({ where: `canals NOT LIKE '%${canalid}%'` });
  }

  getCanalsUsers(canalid: number): Promise<Users[]> {
    return this.usersRepo.find({ where: `canals LIKE '%${canalid}%'` });
  }

  async getGameHistory(id: number) {
    return (await this.usersRepo.findOne(id)).game_history;
  }

  async addGameToUser(id: number, gameid: number) {
    let user: Users;
    await this.usersRepo
      .findOne({ where: `intra_id = '${id}'` })
      .then(function (edit) {
        user = edit;
      });
    user.game_history = this.addIdToSerializedIfNotExist(
      gameid,
      user.game_history,
    );
    this.usersRepo.update(user.id, user);
  }

  // Add a new user muted with a timer
  async addMuteUserTime(id: number, canalid: number, time: string) {
    let user: Users;
    await this.usersRepo
      .findOne({ where: `intra_id = '${id}'` })
      .then(function (result) {
        user = result;
      });
    user.mute = canalid + ';' + time + '|' + user.mute;
    this.usersRepo.update(user.id, user);
  }

  // Add a new user to block list
  async addBanUserTime(id: number, canalid: number, time: string) {
    let user: Users;
    await this.usersRepo
      .findOne({ where: `intra_id = '${id}'` })
      .then(function (result) {
        user = result;
      });
    user.ban = canalid + ';' + time + '|' + user.ban;
    this.usersRepo.save(user);
  }

  async addBlockUser(id: number, blockedid: number) {
    //console.log(typeof blockedid);
    //console.log(id + ' ' + blockedid);
    //console.log(typeof blockedid);
    let user: Users;
    //console.log(typeof blockedid);
    await this.usersRepo
      .findOne({ where: `intra_id = '${id}'` })
      .then(function (result) {
        user = result;
      });
    //console.log(typeof blockedid);
    user.block = this.addIdToSerializedIfNotExist(blockedid, user.block);
    this.usersRepo.save(user);
  }

  async removeBlockUser(id: number, blockedid: number) {
    let user: Users;
    await this.usersRepo
      .findOne({ where: `intra_id = '${id}'` })
      .then(function (result) {
        user = result;
      });

    user.block = this.delIdFromSerializedIfExist(blockedid, user.block);
    //console.log('le user avec ces blcoks = ' + user.block);
    //console.log('le blocked = ' + blockedid);

    this.usersRepo.save(user);
  }

  // fonction qui recupere les users a partir d'un tableau d'id
  // la fonction retourne un tableau de users
  getUsers(ids: Array<number>) {
    return this.usersRepo.find({ where: { intra_id: Any(ids) } });
  }

  // fonction qui supprime un id correspondant a un canal dans chaque liste de canal de chaque utilisateur
  // la fonction ne retourne rien
  async removeCanal(canal_id: number) {
    let users = await this.getCanalsUsers(canal_id);
    for (let user of users) {
      let tmp = user.canals.split(':');
      for (let i = 0; i < tmp.length; i++) {
        if (+tmp[i] == canal_id) {
          tmp.splice(i, 1);
        }
      }
      user.canals = tmp.join(':');
      this.usersRepo.update(user.id, user);
    }
  }

  async removeCanalForUser(canal_id: number, user_id: number) {
    //console.log(user_id);
    //console.log(canal_id);
    let users = await this.usersRepo.find({ where: { intra_id: user_id } });
    //console.log(users);
    for (let user of users) {
      let tmp = user.canals.split(':');
      for (let i = 0; i < tmp.length; i++) {
        if (+tmp[i] == canal_id) {
          tmp.splice(i, 1);
        }
      }
      user.canals = tmp.join(':');
      //console.log(user.canals);
      this.usersRepo.update(user.id, user);
    }
	}
	
  async addCanalForUser(canal_id: number, user_id: number) {
    //console.log(user_id);
    //console.log(canal_id);
    let users = await this.usersRepo.findOne({ where: { intra_id: user_id } });
    //console.log(users);
	  if (users.canals != "") {
		let tmp = users.canals.split(':');
      tmp.push(canal_id.toString());
      users.canals = tmp.join(':');
    } else users.canals = canal_id.toString();
      
      //console.log(users.canals);
      this.usersRepo.update(users.id, users);
    }


  // fonction de serialization d'un tableau d'entiers
  serialize(array: number[]): string {
    return array.join(':');
  }

  // fonction de deserialization d'une string en tableau d'entiers
  deserialize(str: string): number[] {
    return str.split(':').map((x) => +x);
  }

  // fonction qui ajoute un id a une chaine serialisée si il n'est pas deja dedans
  // @param id: l'id à ajouter
  // @param serialized: la chaine serialisée
  // @return: la chaine serialisée avec l'id ajouté
  addIdToSerializedIfNotExist(id: number, serialized: string): string {
    let array = serialized === '' ? [] : this.deserialize(serialized);
    if (array.indexOf(id) === -1) array.push(id);
    return this.serialize(array);
  }

  // fonction qui supprime un id d'une chaine serialisée si il est dedans
  // @param id: l'id à supprimer
  // @param serialized: la chaine serialisée
  // @return: la chaine serialisée sans l'id
  delIdFromSerializedIfExist(id: number, serialized: string): string {
    const array = serialized === '' ? [] : this.deserialize(serialized);
    if (array.indexOf(id) !== -1) array.splice(array.indexOf(id), 1);
    return this.serialize(array);
  }

  // fonction qui ajoute un id correspondant a un canal dans chaque liste de canal de chaque utilisateur
  // la fonction ne retourne rien
  async addCanal(canal_id: number) {
    let users = await this.getCanalsOtherUsers(canal_id);
    for (let user of users) {
      let tmp = user.canals == '' ? [] : this.deserialize(user.canals);
      tmp.push(canal_id);
      user.canals = this.serialize(tmp);
      //console.log('wesh', user.canals);
      this.usersRepo.update(user.id, user);
    }
  }
}
