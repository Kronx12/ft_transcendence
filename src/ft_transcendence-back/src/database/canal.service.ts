import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Canal } from '../entities/canal.entity';
const hash = require('object-hash');

@Injectable()
export class CanalService {
    constructor(@InjectRepository(Canal) private CanalRepo: Repository<Canal>) { }

    getAllCanals(): Promise<Canal[]> {
        return this.CanalRepo.find();
    }

    getCanalById(id: number): Promise<Canal[] | undefined> {
        return this.CanalRepo.find({ where: { id: id } });
    }

    getCanalsByUserId(id: number): Promise<Canal[] | undefined> {
        return this.CanalRepo.find({ where: `users LIKE '%${id}%' OR visibility = 0 OR visibility = 1 ORDER BY visibility` });
    }

    deleteCanalById(id: number) {
        return this.CanalRepo.delete({ id: id });
    }

    createCanal(canal: Canal) {
        canal.name = canal.name.slice(0, 10);

        canal.password = hash(canal.password);
        return this.CanalRepo.save(canal);
    }

    updataCanal(canal: Canal) {
        canal.password = hash(canal.password);
        return this.CanalRepo.save(canal);
    }

    getNonAdminUser(canalid: number): Promise<number[]> {
        return this.getCanalById(canalid).then(canal => {
            let tmp = canal[0];
            if (tmp != undefined) {
                const admins = this.deserialize(tmp.admins);
                const users = this.deserialize(tmp.users);
                const nonAdmins = [];
                for (let i = 0; i < users.length; i++)
                    if (admins.indexOf(users[i]) === -1)
                        nonAdmins.push(users[i]);
                return nonAdmins;
            }
            return [];
        });
    }

    login(canal_id: number, body: any): Promise<boolean> {
        let password = hash(body.password);
        if (body.password === undefined) {
            return Promise.reject('Password is required');
        } else {
            return this.getCanalById(canal_id).then(canal => {
                if (canal[0] !== undefined) {
                    if (canal[0].password === password)
                        return true;
                    else
                        return false;
                } else {
                    return false;
                }
            });
        }
    }

    addAdminUserId(canal_id: number, user: number) {
        this.getCanalById(canal_id).then(canal => {
            let tmp = canal[0];
            tmp.admins = this.addIdToSerializedIfNotExist(user, tmp.admins);
            return this.CanalRepo.save(tmp);
        });
    }

    addUserId(canal_id: number, user: number) {
        this.getCanalById(canal_id).then(canal => {
            let tmp = canal[0];
            tmp.users = this.addIdToSerializedIfNotExist(user, tmp.users);
            return this.CanalRepo.save(tmp);
        });
    }

    delAdminUserId(canal_id: number, user: number) {
        this.getCanalById(canal_id).then(canal => {
            let tmp = canal[0];
            tmp.admins = this.delIdFromSerializedIfExist(user, tmp.admins);
            return this.CanalRepo.save(tmp);
        });
    }

    delUserId(canal_id: number, user: number) {
        this.getCanalById(canal_id).then(canal => {
            let tmp = canal[0];
            tmp.users = this.delIdFromSerializedIfExist(user, tmp.users);
            return this.CanalRepo.save(tmp);
        });
    }

    // fonction de serialization d'un tableau d'entiers
    serialize(array: number[]): string {
        return array.join(':');
    }

    // fonction de deserialization d'une string en tableau d'entiers
    deserialize(str: string): number[] {
        return str.split(':').map(x=>+x);
    }

    // fonction qui ajoute un id a une chaine serialisée si il n'est pas deja dedans
    // @param id: l'id à ajouter
    // @param serialized: la chaine serialisée
    // @return: la chaine serialisée avec l'id ajouté
    addIdToSerializedIfNotExist(id: number, serialized: string): string {
        const array = serialized === "" ? [] : this.deserialize(serialized);
        if (array.indexOf(id) === -1)
            array.push(id);
        return this.serialize(array);
    }

    // fonction qui supprime un id d'une chaine serialisée si il est dedans
    // @param id: l'id à supprimer
    // @param serialized: la chaine serialisée
    // @return: la chaine serialisée sans l'id
    delIdFromSerializedIfExist(id: number, serialized: string): string {
        const array = serialized === "" ? [] : this.deserialize(serialized);
        if (array.indexOf(id) !== -1)
            array.splice(array.indexOf(id), 1);
        return this.serialize(array);
    }
}