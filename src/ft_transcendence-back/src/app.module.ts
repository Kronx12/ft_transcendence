import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from './queue/queue.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseController } from './database/database.controller';
import { ChatController } from './database/chat.controller';
import { GameDatabaseController } from './database/game_database.controller';
import { MessageController } from './database/message.controller';
import { DatabaseService } from './database/database.service';
import { GameDatabaseService } from './database/game_database.service';
import { MessageService } from './database/message.service';
import { ChatService } from './database/chat.service';
import { Users } from './entities/users.entity';
import { Games } from './entities/games.entity';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { config } from './orm.config';


@Module({
  imports: [HttpModule, QueueModule,
    TypeOrmModule.forRoot(config),
    TypeOrmModule.forFeature([Users, Games, Chat, Message])],
  controllers: [AppController, DatabaseController, GameDatabaseController, ChatController, MessageController],
  providers: [AppService, DatabaseService, GameDatabaseService, ChatService, MessageService],
})
export class AppModule {}