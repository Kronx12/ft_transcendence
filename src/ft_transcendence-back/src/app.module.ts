import { Module, HttpModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [HttpModule, QueueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}