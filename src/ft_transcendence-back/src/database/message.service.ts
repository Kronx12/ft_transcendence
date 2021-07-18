import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessageService {
    constructor(@InjectRepository(Message) private messageRepo: Repository<Message>) { }

    findAllChats(): Promise<Message[]> {
        return this.messageRepo.find();
    }

    findOneMessagePerID(id: number): Promise<Message[] | undefined>
    {
        return this.messageRepo.find({where: `id = ${id}`});
    }

    findMessagesCanal(id: string): Promise<Message[] | undefined>
    {
        return this.messageRepo.find({where: `canalid = '${id}'`});
    }

   addMessage(message: Message): Promise<Message[]> {
        return this.messageRepo.save([message]);
    
    }


    async deleteMessage(id: string) {
        await this.messageRepo.delete(id);
        return { ok: true };
    }
}