import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Games {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public uuid: string;

    @Column()
    public player_1: number;

    @Column()
    public player_2: number;

    @Column()
    public score_1: number;

    @Column()
    public score_2: number;

    @Column()
    public victory: number;

    @Column()
    public type: number;
}