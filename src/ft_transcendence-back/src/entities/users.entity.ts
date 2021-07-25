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

  @Column({default: ""})
    public game_history: string;

  @Column()
    public friends: string;
    
  @Column()
    public friends_request: string;

  @Column()
    public asked: string;

  @Column({default: ""})
  public canals: string;
  
  @Column()
  public secret: string;

  @Column()
  public auth: boolean;
}