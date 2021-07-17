import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public message: string;

    @Column()
    public author: string;

    @Column()
    public canalid: string;

}