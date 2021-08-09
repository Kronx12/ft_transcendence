import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
  Headers,
  Head,
} from '@nestjs/common';
import { identity } from 'rxjs';
import { Users } from 'src/entities/users.entity';
import { DatabaseService } from './database.service';
const jwt = require('jsonwebtoken');

@Controller('database')
export class DatabaseController {
  constructor(private readonly databaseServ: DatabaseService) { }

  @Get('user')
  async findAll(@Headers('authorization') auth) {
    return this.databaseServ.findAll();
  }

  @Get('user/:intra')
  async findOne(@Headers('authorization') auth, @Param('intra') id) {
    if (id != '-1') return this.databaseServ.findOne(id);
  }

  // fonction qui recupere tous les user a partir d'un tableau de id
  @Post('users/')
  async getUsers(@Headers('authorization') auth, @Body() users) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err) {
        resp = {
          error: '401 Unauthorized',
        };
      } else {
        resp = await self.databaseServ.getUsers(users);
      }
    });
    return resp;
  }

  @Get('user/search/:name')
  async searchUser(@Headers('authorization') auth, @Param('name') name) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err) {
        resp = { error: '401 Unauthorized' };
      } else {
        resp = self.databaseServ.searchUser(name);
      }
    });
    return resp;
  }

  @Get('friends/:id')
  async getFirends(@Headers('authorization') auth, @Param('id') id) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err) {
        resp = { error: '401 Unauthorized' };
      } else {
        if (id != '-1') resp = self.databaseServ.getFriends(id);
      }
    });
    return resp;
  }

  @Post('user')
  async create(@Body() newUser: Users) {
    return this.databaseServ.create(newUser);
  }

  @Post('ask/:from/:to')
  async askFriend(
    @Headers('authorization') auth,
    @Param('from') from,
    @Param('to') to,
  ) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err) {
        resp = { error: '401 Unauthorized' };
      } else {
        resp = self.databaseServ.requestFriend(from, to);
      }
    });
    return resp;
  }

  @Post('accept/:id/:accept')
  async acceptFriend(
    @Headers('authorization') auth,
    @Param('id') id,
    @Param('accept') accept,
  ) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err) {
        resp = { error: '401 Unauthorized' };
      } else {
        resp = self.databaseServ.acceptFriend(id, accept);
      }
    });
    return resp;
  }

  @Post('remove/:id/:remove')
  async removeFriend(
    @Headers('authorization') auth,
    @Param('id') id,
    @Param('remove') remove,
  ) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err) {
        resp = { error: '401 Unauthorized' };
      } else {
        resp = self.databaseServ.removeFriend(id, remove, 0);
      }
    });
    return resp;
  }

  @Post('refuse/:id/:refuse')
  async refuseFriends(
    @Headers('authorization') auth,
    @Param('id') id,
    @Param('refuse') refuse,
  ) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err) {
        resp = { error: '401 Unauthorized' };
      } else {
        resp = self.databaseServ.refuseFriend(id, refuse);
      }
    });
    return resp;
  }

  @Delete('user/:id')
  async delete(@Headers('authorization') auth, @Param('id') id) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err) {
        resp = { error: '401 Unauthorized' };
      } else {
        resp = self.databaseServ.delete(id);
      }
    });
    return resp;
  }

  @Patch('user/:id')
  async editUser(
    @Headers('authorization') auth,
    @Param('id') id,
    @Body() content,
  ) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err) {
        resp = { error: '401 Unauthorized' };
      } else {
        resp = self.databaseServ.editUser(id, content);
      }
    });
    return resp;
  }

  @Get('user/game/:id/')
  async getGameHistory(@Headers('authorization') auth, @Param('id') id) {
    return this.databaseServ.getGameHistory(id);
  }

  @Patch('user/game/:id/:gameid')
  async addGameToUser(
    @Headers('authorization') auth,
    @Param('id') id,
    @Param('gameid') gameid,
  ) {
    return this.databaseServ.addGameToUser(id, gameid);
  }

  // /database/other_users/:id
  @Get('/other_users/:id')
  async getCanalsOtherUsers(@Headers('authorization') auth, @Param('id') id) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err)
        resp = { error: '401 Unauthorized' };
      else
        resp = self.databaseServ.getCanalsOtherUsers(id);
    });
    return resp;
  }

  // Mute with a duration
  @Post('/mute/:id/:canalid/:time')
  async addMuteUserTime(@Headers('authorization') auth, @Param('id') id, @Param('canalid') canalid, @Param('time') time) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err)
        resp = { error: '401 Unauthorized' };
      else
        resp = self.databaseServ.addMuteUserTime(id, canalid, time);
    });
  }

  @Post('/ban/:id/:canalid/:time')
  async addBanUserTime(@Headers('authorization') auth, @Param('id') id, @Param('canalid') canalid, @Param('time') time) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err)
        resp = { error: '401 Unauthorized' };
      else
        resp = self.databaseServ.addBanUserTime(id, canalid, time);
    });
  }

  @Post('/block/:id/:blockedid')
  async addBlockUser(@Headers('authorization') auth, @Param('id') id, @Param('blockedid') blockedid)
  {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err)
        resp = { error: '401 Unauthorized' };
      else
        resp = self.databaseServ.addBlockUser(id, +blockedid);
    });
  }

  @Post('/unblock/:id/:blockedid')
  async removeBlockUser(@Headers('authorization') auth, @Param('id') id, @Param('blockedid') blockedid) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err)
        resp = { error: '401 Unauthorized' };
      else
        resp = self.databaseServ.removeBlockUser(id, +blockedid);
    });
  }

  // /database/user/delete/:canal_id
  @Patch('/user/delete/:canal_id')
  async deleteCanal(@Headers('authorization') auth, @Param('canal_id') canal_id) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err)
        resp = { error: '401 Unauthorized' };
      else
        resp = self.databaseServ.removeCanal(canal_id);
    });
    return resp;
  }

  // /database/user/delete_one/:canal_id/:user_id
  @Patch('/user/delete_one/:canal_id/:user_id')
  async deleteCanalForUser(@Headers('authorization') auth, @Param('canal_id') canal_id, @Param('user_id') user_id) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err)
        resp = { error: '401 Unauthorized' };
      else
        resp = self.databaseServ.removeCanalForUser(canal_id, user_id);
    });
    return resp;
  }

  // /database/user/add/:canal_id
  @Patch('/user/add/:canal_id')
  async addCanal(@Headers('authorization') auth, @Param('canal_id') canal_id) {
    const self = this;
    let resp;
    await jwt.verify(auth, 'shhhhh', async function (err, decoded) {
      if (err)
        resp = { error: '401 Unauthorized' };
      else
        resp = self.databaseServ.addCanal(canal_id);
    });
    return resp;
  }
}