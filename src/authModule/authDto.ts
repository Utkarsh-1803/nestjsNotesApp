import { IsNotEmpty, Length, Matches, IsEmail } from 'class-validator';

export class UserLogin {

  @IsNotEmpty()
  emailId: string;

  @IsNotEmpty()
  password: string;

}

export class UserSignUp {

  @IsNotEmpty()
  @IsEmail()
  emailId: string;

  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=]).+$/, {
    message:
      'confirmPassword must contain at least one uppercase, one numeric, and one special character!',
  })
  @Length(8, 16, {
    message:
      'confirmPassword must contain at least 8 characters and atmost 16 characters!',
  })
  confirmPassword: string;

  @IsNotEmpty()
  @Length(8, 16, {
    message:
      'Password must contain at least 8 characters and atmost 16 characters!',
  })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=]).+$/, {
    message:
      'Password must contain at least one uppercase, one numeric, and one special character!',
  })
  password: string;

}