import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Canal {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public owner: number;

  @Column()
  public users: string;

  @Column()
  public admins: string;

  @Column({default: ""})
  public password: string;

  @Column({default: 0})
  public visibility: number;

}