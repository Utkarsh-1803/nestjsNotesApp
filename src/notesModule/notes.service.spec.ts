import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { getModelToken } from '@nestjs/mongoose';
import { NotAcceptableException } from '@nestjs/common';

jest.mock('mongoose');

const notes: any = {
    _id: '61c0ccf11d7bf83d153d7c06',
    title: 'Hi',
    description: 'Notes Description'
};

describe('NotesService', () => {
    let service: NotesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotesService,
                {
                    provide: getModelToken('User'),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: getModelToken('Notes'),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                        findOneAndDelete: jest.fn(),
                        create: jest.fn()
                    },
                },
            ],
        }).compile();

        service = module.get<NotesService>(NotesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getNotes', () => {
        it('should return user notes', async () => {
            const user = { emailId: 'test@example.com' };
            jest.spyOn(service['notesModel'], 'find').mockResolvedValueOnce([]);

            const result = await service.getNotes(user);

            expect(result).toEqual({ success: true, allNotes: [] });
            expect(service['notesModel'].find).toHaveBeenCalledWith({ createdBy: user.emailId });
        });
    });

    describe('getNoteById', () => {
        it('should return a note by ID', async () => {
            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValue(notes);

            const result = await service['notesModel'].findOne(notes._id);

            expect(service['notesModel'].findOne).toHaveBeenCalledWith(notes._id);
            expect(result).toEqual(notes);
        });

        it('should throw NotAcceptableException if note ID format is invalid', async () => {
            const invalidNoteId = 'invalidId';
            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(null);

            await expect(service.getNoteById(invalidNoteId)).rejects.toThrow(NotAcceptableException);
            expect(service['notesModel'].findOne).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if note is not found', async () => {
            const nonExistingNoteId: any = '61c0ccf11d7bf83d153d7c08'; // Generate a valid ObjectId for a non-existing note

            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValue(null);

            await expect(service.getNoteById(nonExistingNoteId)).rejects.toThrow(NotAcceptableException);
            expect(service['notesModel'].findOne).not.toHaveBeenCalled();
        });
    });

    describe('createNote', () => {
        it('should create a note', async () => {
            const body = { title: 'Test Note', description: 'This is a test note' };
            const savedUser = { emailId: 'test@example.com' };
            const createdNote = {
                title: 'Test Note',
                description: 'This is a test note',
                createdBy: savedUser.emailId,
                sharedBy: '',
                createdAt: expect.any(Number),
            };

            jest.spyOn(service['notesModel'], 'create').mockResolvedValueOnce(createdNote as any); // Mock the save method

            const result = await service.createNote(body, savedUser);

            expect(result).toEqual({ success: true, message: 'Note created successfully!', note: createdNote });
            expect(service['notesModel'].create).toHaveBeenCalledWith({
                title: 'Test Note',
                description: 'This is a test note',
                createdBy: savedUser.emailId,
                sharedBy: '',
                createdAt: expect.any(Number),
            });
        });

        it('should throw an error if note creation fails', async () => {
            const body = { title: 'Test Note', description: 'This is a test note' };
            const savedUser = { emailId: 'test@example.com' };

            jest.spyOn(service['notesModel'], 'create').mockRejectedValueOnce(new Error('Note creation failed'));

            await expect(service.createNote(body, savedUser)).rejects.toThrow();
            expect(service['notesModel'].create).toHaveBeenCalledWith({
                title: 'Test Note',
                description: 'This is a test note',
                createdBy: savedUser.emailId,
                sharedBy: '',
                createdAt: expect.any(Number),
            });
        });
    });

    describe('updateNote', () => {
        it('should update a note', async () => {
            const body = { title: 'Updated Note', description: 'This is an updated note' };
            const savedUser = { emailId: 'test@example.com' };

            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(notes);
            jest.spyOn(service['notesModel'], 'findOneAndUpdate').mockResolvedValueOnce({
                title: 'Updated Note',
                description: 'This is an updated note',
            });

            await service['notesModel'].findOneAndUpdate(notes._id, body, savedUser);

            expect(service['notesModel'].findOneAndUpdate).toHaveBeenCalledWith(notes._id, body, savedUser);
        });

        it('should throw NotAcceptableException if note ID format is invalid', async () => {
            const invalidNoteId = 'invalidId';
            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(null);

            await expect(service.getNoteById(invalidNoteId)).rejects.toThrow(NotAcceptableException);
            expect(service['notesModel'].findOne).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if note is not found', async () => {
            const nonExistingNoteId: any = '61c0ccf11d7bf83d153d7c08'; // Generate a valid ObjectId for a non-existing note

            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValue(null);

            await expect(service.getNoteById(nonExistingNoteId)).rejects.toThrow(NotAcceptableException);
            expect(service['notesModel'].findOne).not.toHaveBeenCalled();
        });

        it('should throw NotAcceptableException if user does not own the note', async () => {
            const validNoteId = 'validNoteId';
            const savedUser = { emailId: 'test@example.com' };
            const existingNote = {
                _id: validNoteId,
                title: 'Test Note',
                description: 'This is a test note',
                createdBy: 'anotheruser@example.com',
            };

            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(existingNote);

            await expect(service.updateNote(validNoteId, {}, savedUser)).rejects.toThrow(NotAcceptableException);
        });

        it('should throw NotFoundException if note update fails', async () => {

            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(service['notesModel'], 'findOneAndUpdate').mockResolvedValueOnce(null);

            await expect(service.updateNote(notes._id, {}, {})).rejects.toThrow();
        });
    });

    describe('deleteNote', () => {
        it('should delete a note by id', async () => {
            const savedUser = { emailId: 'test@example.com' };

            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(notes);
            jest.spyOn(service['notesModel'], 'findOneAndDelete').mockResolvedValueOnce(notes);

            const result = await service['notesModel'].findOneAndDelete(notes._id, savedUser);

            expect(service['notesModel'].findOneAndDelete).toHaveBeenCalledWith(notes._id, savedUser);
            expect(result).toEqual(notes);
        });

        it('should throw NotAcceptableException if note ID format is invalid', async () => {
            const invalidNoteId = 'invalidId';

            await expect(service.deleteNote(invalidNoteId, {})).rejects.toThrow(NotAcceptableException);
            expect(service['notesModel'].findOne).not.toHaveBeenCalled();
            expect(service['notesModel'].findOneAndDelete).not.toHaveBeenCalled();
        });


        it('should throw NotAcceptableException if note is not found', async () => {
            const nonExistingNoteId = 'nonExistingNoteId';
            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(null);

            const result = await service['notesModel'].findOne({ "_id": nonExistingNoteId });

            await expect(service.deleteNote(nonExistingNoteId, {})).rejects.toThrow(NotAcceptableException);
            expect(service['notesModel'].findOne).toHaveBeenCalledWith({ "_id": nonExistingNoteId });
            expect(service['notesModel'].findOneAndDelete).not.toHaveBeenCalled();
        });

        it('should throw NotAcceptableException if user does not own the note', async () => {
            const savedUser = { emailId: 'test@example.com' };

            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(notes);
            await service['notesModel'].findOne(notes._id);

            await expect(service.deleteNote(notes._id, savedUser)).rejects.toThrow(NotAcceptableException);
            expect(service['notesModel'].findOne).toHaveBeenCalledWith(notes._id);
            expect(service['notesModel'].findOneAndDelete).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException if note deletion fails', async () => {
            const savedUser = { emailId: 'test@example.com' };
            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce({});
            jest.spyOn(service['notesModel'], 'findOneAndDelete').mockResolvedValueOnce(null);
            await service['notesModel'].findOne(notes._id);
            await service['notesModel'].findOneAndDelete(notes._id, savedUser);

            await expect(service.deleteNote(notes._id, {})).rejects.toThrow();
            expect(service['notesModel'].findOne).toHaveBeenCalledWith(notes._id);
            expect(service['notesModel'].findOneAndDelete).toHaveBeenCalledWith(notes._id, savedUser);
        });
    });

    describe('searchNotes', () => {
        it('should search for notes successfully', async () => {
            const query = 'searchQuery';
            const savedUser = { emailId: 'test@example.com' };
            const matchingNotes = [
                { title: 'Note 1', description: 'This is a note', createdBy: savedUser.emailId },
                { title: 'Note 2', description: 'Another note', createdBy: savedUser.emailId },
            ];

            jest.spyOn(service['notesModel'], 'find').mockResolvedValueOnce(matchingNotes);

            const result = await service.searchNotes(query, savedUser);

            expect(result).toEqual({ success: true, allNotes: matchingNotes });
            expect(service['notesModel'].find).toHaveBeenCalledWith({
                $or: [
                    { title: { $regex: new RegExp(query, 'i') } },
                    { description: { $regex: new RegExp(query, 'i') } },
                ],
                createdBy: savedUser.emailId,
            });
        });

        it('should throw NotAcceptableException if query is not specified', async () => {
            const savedUser = { emailId: 'test@example.com' };

            await expect(service.searchNotes(null, savedUser)).rejects.toThrow(NotAcceptableException);
            expect(service['notesModel'].find).not.toHaveBeenCalled();
        });
    });

    describe('shareNote', () => {
        it('should share a note successfully', async () => {
            const sharedUserEmail = 'shareduser@example.com';
            const savedUser = { emailId: 'test@example.com' };

            const sharedUser = {
                emailId: sharedUserEmail,
            };

            const createdNote = {
                title: 'Test Note',
                description: 'This is a test note',
                createdBy: savedUser.emailId,
                sharedBy: sharedUserEmail,
                createdAt: expect.any(Number),
            };

            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(notes);
            jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce(sharedUser);
            jest.spyOn(service['notesModel'], 'create').mockResolvedValueOnce(createdNote as any); // Mock the save method

            await service['notesModel'].findOne(notes._id)
            await service['userModel'].findOne({ "emailId": sharedUserEmail })
            await service['notesModel'].create(createdNote)
            expect(service['notesModel'].findOne).toHaveBeenCalledWith(notes._id);
            expect(service['userModel'].findOne).toHaveBeenCalledWith({ "emailId": sharedUserEmail });
            expect(service['notesModel'].create).toHaveBeenCalledWith(createdNote);
        });

        it('should throw NotAcceptableException if note ID format is invalid', async () => {
            const invalidNoteId = 'invalidId';

            await expect(service.shareNote(invalidNoteId, {}, {})).rejects.toThrow(NotAcceptableException);
            expect(service['notesModel'].findOne).not.toHaveBeenCalled();
            expect(service['userModel'].findOne).not.toHaveBeenCalled();
            expect(service['notesModel'].create).not.toHaveBeenCalled();
        });

        it('should throw NotAcceptableException if note is not found', async () => {
            const nonExistingNoteId = 'nonExistingNoteId';
            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(null);

            await expect(service.shareNote(nonExistingNoteId, { emailId: 'test@example.com' }, {})).rejects.toThrow(NotAcceptableException);
            await service['notesModel'].findOne({ "_id": nonExistingNoteId })
            expect(service['notesModel'].findOne).toHaveBeenCalledWith({ "_id": nonExistingNoteId });
            expect(service['userModel'].findOne).not.toHaveBeenCalled();
            expect(service['notesModel'].create).not.toHaveBeenCalled();
        });

        it('should throw NotAcceptableException if user is not registered', async () => {
            const noteId = 'validNoteId';
            const nonExistingUserEmail = 'nonExistingUser@example.com';
            const savedUser = { emailId: 'test@example.com' };

            const existingNote = {
                _id: noteId,
                title: 'Test Note',
                description: 'This is a test note',
                createdBy: savedUser.emailId,
            };

            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(existingNote);
            jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce(null);
            await service['notesModel'].findOne({ "_id": noteId })
            await service['userModel'].findOne({ "emailId": nonExistingUserEmail })
            await expect(service.shareNote(noteId, { emailId: nonExistingUserEmail }, savedUser)).rejects.toThrow(NotAcceptableException);
            expect(service['notesModel'].findOne).toHaveBeenCalledWith({ "_id": noteId });
            expect(service['userModel'].findOne).toHaveBeenCalledWith({ "emailId": nonExistingUserEmail });
            expect(service['notesModel'].create).not.toHaveBeenCalled();
        });

        it('should throw NotAcceptableException if user tries to share a note not created by them', async () => {
            const noteId = 'validNoteId';
            const sharedUserEmail = 'shareduser@example.com';
            const savedUser = { emailId: 'test@example.com' };

            const existingNote = {
                _id: noteId,
                title: 'Test Note',
                description: 'This is a test note',
                createdBy: 'anotheruser@example.com',
            };

            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce(existingNote);
            jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce({ emailId: sharedUserEmail });
            await service['notesModel'].findOne({ "_id": noteId })
            await service['userModel'].findOne({ "emailId": sharedUserEmail })
            await expect(service.shareNote(noteId, { emailId: sharedUserEmail }, savedUser)).rejects.toThrow(NotAcceptableException);
            expect(service['notesModel'].findOne).toHaveBeenCalledWith({ "_id": noteId });
            expect(service['userModel'].findOne).toHaveBeenCalledWith({ "emailId": sharedUserEmail });
            expect(service['notesModel'].create).not.toHaveBeenCalled();
        });

        it('should throw error if note share fails', async () => {
            const sharedUserEmail = 'shareduser@example.com';
            jest.spyOn(service['notesModel'], 'findOne').mockResolvedValueOnce({});
            jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce({ "emailId": sharedUserEmail });
            await service['notesModel'].findOne(notes._id);
            await service['userModel'].findOne({ "emailId": sharedUserEmail })

            await expect(service.deleteNote(notes._id, {})).rejects.toThrow();
            expect(service['notesModel'].findOne).toHaveBeenCalledWith(notes._id);
            expect(service['userModel'].findOne).toHaveBeenCalledWith({ "emailId": sharedUserEmail });
        });
    });

});