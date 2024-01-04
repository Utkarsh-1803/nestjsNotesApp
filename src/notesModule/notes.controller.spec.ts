import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { CreateNote, ShareNote } from './notesDto';
import { getModelToken } from '@nestjs/mongoose';

jest.mock('./notes.service');

describe('NotesController', () => {
    let controller: NotesController;
    let service: NotesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotesController],
            providers: [
                NotesService,
                {
                    provide: getModelToken('User'), // Adjust with your User model token
                    useValue: {},
                },
                {
                    provide: getModelToken('Notes'), // Adjust with your Notes model token
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<NotesController>(NotesController);
        service = module.get<NotesService>(NotesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getNotes', () => {
        it('should return an array of notes', async () => {
            const user = { id: 1, username: 'testUser' };
            const result: any = ['note1', 'note2'];
            jest.spyOn(service, 'getNotes').mockImplementation(async () => result);

            expect(await controller.getNotes({ user })).toBe(result);
        });
    });

    describe('getNoteById', () => {
        it('should return a single note by ID', async () => {
            const result: any = 'note1';
            jest.spyOn(service, 'getNoteById').mockImplementation(async () => result);

            expect(await controller.getNoteById('1')).toBe(result);
        });
    });

    describe('createNote', () => {
        it('should create a new note', async () => {
            const user = { id: 1, username: 'testUser' };
            const body: CreateNote = { title: 'New Note', description: 'This is a new note' };
            const result: any = 'Note created successfully';
            jest.spyOn(service, 'createNote').mockImplementation(async () => result);

            expect(await controller.createNote(body, { user })).toBe(result);
        });
    });

    describe('updateNote', () => {
        it('should update an existing note', async () => {
            const user = { id: 1, username: 'testUser' };
            const body: CreateNote = { title: 'Updated Note', description: 'This note has been updated' };
            const result: any = 'Note updated successfully';
            jest.spyOn(service, 'updateNote').mockImplementation(async () => result);

            expect(await controller.updateNote('1', body, { user })).toBe(result);
        });
    });

    describe('deleteNote', () => {
        it('should delete an existing note', async () => {
            const user = { id: 1, username: 'testUser' };
            const result: any = 'Note deleted successfully';
            jest.spyOn(service, 'deleteNote').mockImplementation(async () => result);

            expect(await controller.deleteNote('1', { user })).toBe(result);
        });
    });

    describe('searchNotes', () => {
        it('should search for notes based on a query', async () => {
            const user = { id: 1, username: 'testUser' };
            const query = 'searchQuery';
            const result: any = ['note1', 'note2'];
            jest.spyOn(service, 'searchNotes').mockImplementation(async () => result);

            expect(await controller.searchNotes(query, { user })).toBe(result);
        });
    });

    describe('shareNote', () => {
        it('should share a note', async () => {
            const user = { id: 1, username: 'testUser' };
            const body: ShareNote = { emailId: 'test@example.com' };
            const result: any = 'Note shared successfully';
            jest.spyOn(service, 'shareNote').mockImplementation(async () => result);

            expect(await controller.shareNote('1', body, { user })).toBe(result);
        });
    });
});
