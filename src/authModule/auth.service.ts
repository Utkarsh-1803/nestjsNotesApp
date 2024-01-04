import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../schemas';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<typeof User>,
    private jwtService: JwtService,
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  // for registeration
  async signup(body: any) {
    try {

      if (body.password !== body.confirmPassword) {
        throw new NotAcceptableException(['Password and confirm password should match'])
      }

      const userExists: any = await this.userModel.findOne({ emailId: body.emailId });

      if (!!userExists) throw new NotAcceptableException(['Emailid already exists']);

      const hashedPassword = await bcrypt.hash(body.password, 10);

      const userData = {
        emailId: body.emailId,
        password: hashedPassword,
        status: 'Active',
        createdAt: Number(new Date())
      }

      let updatedUser: any = await this.userModel.findOneAndUpdate({ emailId: body.emailId }, userData, { upsert: true, new: true });
      if (updatedUser) {
        return {
          success: true,
          message: 'Registered Successfully!'
        }
      }
      else throw new NotAcceptableException(['Something went wrong, please try again!'])
    }
    catch (err) {
      throw err
    }
  }

  // for signin using password
  async login(body: any) {
    try {
      //finding user who is present in database
      let user: any = await this.userModel.findOne({ emailId: body.emailId });
      //if not user means username is wrong.
      if (!user) {
        throw new NotAcceptableException(['Invalid EmailId or Password!'])
      }

      //checking if password matches or not
      let isVerified = await bcrypt.compare(body.password, user.password);

      if (!isVerified) {
        throw new NotAcceptableException(['Invalid Username or Password!'])
      }

      //setting up payload in jwt Token
      const payload = { emailId: user.emailId }

      //generating jwtToken and passing it to response
      let jwtToken = await this.jwtService.signAsync(payload);

      return {
        success: true,
        user: user,
        access_Token: jwtToken,
        message: 'Looged In successfully!'
      }
    }
    catch (error) {
      throw error
    }
  }

}