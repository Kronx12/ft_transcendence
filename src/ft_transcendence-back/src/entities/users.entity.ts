import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Users {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public intra_id: number;

    @Column()
    public username: string;

    @Column()
    public avatar: string;

    @Column()
    public status: number;


}