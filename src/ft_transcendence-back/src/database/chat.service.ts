import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';

@Injectable()
export class ChatService {
    constructor(@InjectRepository(Chat) private chatRepo: Repository<Chat>) { }

    findAllMessages(): Promise<Chat[]> {
        return this.chatRepo.find();
    }

    findOneMessage(author: string): Promise<Chat[] | undefined>
    {
        return this.chatRepo.find({where: `author = '${author}'`});
    }

    findOneMessagePerID(id: number): Promise<Chat[] | undefined>
    {
        return this.chatRepo.find({where: `id = ${id}`});
    }

    async addMessage(message: Chat) {
        await this.chatRepo.save(message);
        return this.findOneMessagePerID(message.id);
    }

    async deleteMessage(id: string) {
        await this.chatRepo.delete(id);
        return { ok: true };
    }
}