import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Canal } from '../entities/canal.entity';

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
        return this.CanalRepo.save(canal);
    }

    updataCanal(canal: Canal) {
        return this.CanalRepo.save(canal);
    }

    getNonAdminUserIds(canalid: number): number[] {
        const canal = this.getCanalById(canalid)[0];
        if (canal != undefined) {
            const admins = canal.admins.split(':');
            const users = canal.users.split(':');
            const nonAdmins = [];
            for (let i = 0; i < users.length; i++) {
                if (admins.indexOf(users[i]) === -1) {
                    nonAdmins.push(users[i]);
                }
            }
            return nonAdmins;
        }
        return [];
    }

    // fonction qui ajoute un number id dans une chaine serialisée
    // @param id: le numéro id à ajouter
    // @param serialized: la chaine serialisée
    // @return: la chaine serialisée avec l'id ajouté
    addIdToSerialized(id: number, serialized: string): string {
        const array = this.deserialize(serialized);
        array.push(id);
        return this.serialize(array);
    }

    // fonction qui récupère le dernier id ajouté dans une chaine serialisée
    // @param serialized: la chaine serialisée
    // @return: le dernier id ajouté dans la chaine serialisée
    getLastIdFromSerialized(serialized: string): number {
        const array = this.deserialize(serialized);
        return array[array.length - 1];
    }

    // fonction de serialization d'un tableau d'entiers
    serialize(array: number[]): string {
        return array.join(':');
    }

    // fonction de deserialization d'une string en tableau d'entiers
    deserialize(string: string): number[] {
        return string.split(':').map(x=>+x);
    }

    // fonction qui save un canal en modifiant les utilisateurs
    // @param canal: le canal à sauvegarder
    // @param user: id du nouvel utilisateur
        // @return: le canal sauvegardé
    addIdToUser(canal: Canal, user: number) {
        canal.users = this.addIdToSerialized(user, canal.users)
        return this.CanalRepo.save(canal);
    }
    
    addIdToAdmins(canal: Canal, user: number) {
        canal.admins = this.addIdToSerialized(user, canal.admins)
        return this.CanalRepo.save(canal);
    }
}