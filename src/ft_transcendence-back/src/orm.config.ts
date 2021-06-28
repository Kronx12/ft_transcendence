import { TypeOrmModuleOptions } from "@nestjs/typeorm";
export const config: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'database',
    port: 5432,
    username: 'gros_pd_user',
    password: 'pas_ce_word',
    database: 'dans_ta_base',
    entities: [ __dirname + '/../**/*.entity.js',],
    synchronize: true,
}