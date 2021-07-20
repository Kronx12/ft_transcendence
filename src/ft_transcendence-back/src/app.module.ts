import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from './queue/queue.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseController } from './database/database.controller';
import { CanalController } from './database/canal.controller';
import { GameDatabaseController } from './database/game_database.controller';
import { MessageController } from './database/message.controller';
import { DatabaseService } from './database/database.service';
import { GameDatabaseService } from './database/game_database.service';
import { MessageService } from './database/message.service';
import { CanalService } from './database/canal.service';
import { Users } from './entities/users.entity';
import { Games } from './entities/games.entity';
import { Canal } from './entities/canal.entity';
import { Message } from './entities/message.entity';
import { config } from './orm.config';


@Module({
  imports: [HttpModule, QueueModule,
    TypeOrmModule.forRoot(config),
    TypeOrmModule.forFeature([Users, Games, Canal, Message])],
  controllers: [AppController, DatabaseController, GameDatabaseController, CanalController, MessageController],
  providers: [AppService, DatabaseService, GameDatabaseService, CanalService, MessageService],
})
export class AppModule {}