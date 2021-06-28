import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import  { Users }  from '../entities/users.entity'

@Injectable()
export class DatabaseService {
    constructor(
        @InjectRepository(Users)
        private usersRepo: Repository<Users>
    ){}

    findAll(): Promise<Users[]> {
        return this.usersRepo.find();
    }
}  
