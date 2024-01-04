import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, Notes } from 'src/schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notes', schema: Notes },
      { name: 'User', schema: User },
    ]),
  ],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}