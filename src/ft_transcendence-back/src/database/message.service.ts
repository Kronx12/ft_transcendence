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

    createMessage(mess: string, author: number, canalid: number) {
        let msg = {
            id: undefined,
            message: mess,
            author: author,
            canalid: canalid
        };
        return this.messageRepo.save(msg);
    }
}