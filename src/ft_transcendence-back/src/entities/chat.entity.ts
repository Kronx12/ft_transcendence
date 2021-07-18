import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public users: string;

  @Column()
  public admins: string;

  @Column()
  public owner: string;

  @Column({default: ""})
  public password: string;

  @Column({default: ""})
  public image: string;

}