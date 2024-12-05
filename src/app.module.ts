import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
    }),
    TasksModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST);
    console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT);
    console.log('POSTGRES_USER:', process.env.POSTGRES_USER);
    console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD);
    console.log('POSTGRES_DATABASE:', process.env.POSTGRES_DATABASE);
  }
}
