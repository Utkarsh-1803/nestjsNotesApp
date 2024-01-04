import { NotesService } from './notes.service';
import { Get, Controller, Put, Req, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { CreateNote, ShareNote } from './notesDto';

@Controller()
export class NotesController {
  constructor(private readonly notesService: NotesService) { }

  @Get('/notes')
  async getNotes(@Req() req: any) {
    return await this.notesService.getNotes(req.user);
  }

  @Get('/notes/:id')
  async getNoteById(@Param('id') id: string) {
    return await this.notesService.getNoteById(id);
  }

  @Post('/notes')
  async createNote(@Body() body: CreateNote, @Req() req: any) {
    return await this.notesService.createNote(body, req.user);
  }

  @Put('/notes/:id')
  async updateNote(@Param('id') id: string, @Body() body: CreateNote, @Req() req: any) {
    return await this.notesService.updateNote(id, body, req.user);
  }

  @Delete('/notes/:id')
  async deleteNote(@Param('id') id: string, @Req() req: any) {
    return await this.notesService.deleteNote(id, req.user);
  }

  @Get('search')
  async searchNotes(@Query('q') query: string, @Req() req: any) {
    return await this.notesService.searchNotes(query, req.user);
  }

  @Post('/notes/:id/share')
  async shareNote(@Param('id') id: string, @Body() body: ShareNote, @Req() req: any) {
    return await this.notesService.shareNote(id, body, req.user);
  }

}