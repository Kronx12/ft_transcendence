import { Module } from "@nestjs/common";
import { ScheduleModule } from '@nestjs/schedule';
import { QueueService } from "./queue.gateway";

@Module({
    imports: [ScheduleModule.forRoot()],
    providers: [QueueService]
})
export class QueueModule {}