import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessageService {
    constructor(@InjectRepository(Message) private messageRepo: Repository<Message>) { }

    getAllMessages(): Promise<Message[]> {
        return this.messageRepo.find();
    }

    getMessagesByCanalId(id: number): Promise<Message[] | undefined> {
        return this.messageRepo.find({ where: { canalid: id } });
    }

    createMessage(msg: Message) {
        return this.messageRepo.create(msg);
    }
}