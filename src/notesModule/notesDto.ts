import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateNote {

    @IsNotEmpty()
    title: string

    @IsNotEmpty()
    description: string

}

export class ShareNote {

    @IsEmail()
    @IsNotEmpty()
    emailId: string

}