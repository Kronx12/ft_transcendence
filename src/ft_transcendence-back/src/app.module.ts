import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from './queue/queue.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseController } from './database/database.controller';
import { DatabaseService } from './database/database.service';
import { Users } from './entities/users.entity';
import { config } from './orm.config';


@Module({
  imports: [HttpModule, QueueModule,
    TypeOrmModule.forRoot(config),
    TypeOrmModule.forFeature([Users])],
  controllers: [AppController, DatabaseController],
  providers: [AppService, DatabaseService],
})
export class AppModule {}