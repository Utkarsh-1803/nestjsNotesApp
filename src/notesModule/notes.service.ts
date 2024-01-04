import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, Notes } from 'src/schemas';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<typeof User>,
    @InjectModel('Notes') private readonly notesModel: Model<typeof Notes>,
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  // to get all list of notes
  async getNotes(savedUser: any) {
    try {
      const allNotes = await this.notesModel.find({ "createdBy": savedUser.emailId });
      return {
        success: true,
        allNotes: allNotes,
      }
    }
    catch (err) {
      throw err;
    }
  }

  // to get a note by id
  async getNoteById(id: string) {
    try {
      // Check if the provided id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotAcceptableException(['Invalid ObjectId format']);
      }
      const targetId = new mongoose.Types.ObjectId(id)
      const note = await this.notesModel.findOne({ "_id": targetId });
      if (!note) throw new NotFoundException(['Note not found!'])
      return {
        success: true,
        note: note,
      }
    }
    catch (err) {
      throw err;
    }
  }

  // to create a note
  async createNote(body: any, savedUser: any) {
    try {
      const noteData = {
        title: body.title,
        description: body.description,
        createdBy: savedUser.emailId,
        sharedBy: '',
        createdAt: Number(new Date())
      }

      const res = await this.notesModel.create(noteData);

      return {
        success: true,
        message: 'Note created successfully!',
        note: res,
      }
    }
    catch (err) {
      throw err;
    }
  }

  // to update a note
  async updateNote(id: any, body: any, savedUser: any) {
    try {
      // Check if the provided id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotAcceptableException(['Invalid ObjectId format']);
      }
      const targetId = new mongoose.Types.ObjectId(id);
      const noteFound: any = await this.notesModel.findOne({ "_id": targetId });
      if (!noteFound) throw new NotAcceptableException(['Note not found!']);

      //check for ownership
      if (noteFound.createdBy != savedUser.emailId) throw new NotAcceptableException(['You cannot update this note as it is not created by you!'])

      const newNoteData = {
        title: body.title,
        description: body.description,
      }
      const note = await this.notesModel.findOneAndUpdate({ "_id": targetId }, newNoteData, { new: true });
      if (!note) throw new NotFoundException(['Unable to update note, please try again!'])
      return {
        success: true,
        message: 'Note updated successfully!',
        note: note,
      }
    }
    catch (err) {
      throw err;
    }
  }

  // to delete a note by id
  async deleteNote(id: string, savedUser: any) {
    try {
      // Check if the provided id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotAcceptableException(['Invalid ObjectId format']);
      }
      const targetId = new mongoose.Types.ObjectId(id)
      const noteFound: any = await this.notesModel.findOne({ "_id": targetId });
      if (!noteFound) throw new NotAcceptableException(['Note not found!']);

      //check for ownership
      if (noteFound.createdBy != savedUser.emailId) throw new NotAcceptableException(['You cannot delete this note as it is not created by you!'])

      const note = await this.notesModel.findOneAndDelete({ "_id": targetId });
      if (!note) throw new NotFoundException(['Unable to delete, please try again!'])
      return {
        success: true,
        message: 'Note deleted successfully!',
      }
    }
    catch (err) {
      throw err;
    }
  }

  // to search using query
  async searchNotes(query: any, savedUser: any) {
    try {
      if (!query) throw new NotAcceptableException(['Please specify the proper query'])
      const searchRegex = new RegExp(query, 'i');
      const searchQuery = {
        $or: [{ title: { $regex: searchRegex } }, { description: { $regex: searchRegex } }],
        createdBy: savedUser.emailId
      };
      const allNotes = await this.notesModel.find(searchQuery);
      return {
        success: true,
        allNotes: allNotes,
      }
    }
    catch (err) {
      throw err;
    }
  }

  // to update a note
  async shareNote(id: any, body: any, savedUser: any) {
    try {
      // Check if the provided id is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new NotAcceptableException(['Invalid ObjectId format']);
      }
      const targetId = new mongoose.Types.ObjectId(id)

      const noteFound: any = await this.notesModel.findOne({ "_id": targetId });
      if (!noteFound) throw new NotAcceptableException(['Note not found!']);

      //check for ownership
      if (noteFound.createdBy != savedUser.emailId) throw new NotAcceptableException(['You cannot share this note as it is not created by you!'])

      const sharedUser: any = await this.userModel.findOne({ "emailId": body.emailId });
      if (!sharedUser) throw new NotAcceptableException(['The User you want to share note is not registered with us!']);
      const noteData = {
        title: noteFound.title,
        description: noteFound.description,
        createdBy: sharedUser.emailId,
        sharedBy: savedUser.emailId,
        createdAt: Number(new Date())
      }
       await this.notesModel.create(noteData);
      return {
        success: true,
        message: 'Note shared successfully!',
      }

    }
    catch (err) {
      throw err;
    }
  }

}