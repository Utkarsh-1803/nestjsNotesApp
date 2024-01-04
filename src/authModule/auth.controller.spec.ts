import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

jest.mock('./auth.service');
jest.mock('@nestjs/jwt');

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                AuthService,
                JwtService,
                {
                    provide: getModelToken('User'), // Adjust with your User model token
                    useValue: {},
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should call authService.login with the correct parameters', async () => {
            const loginDto = { emailId: 'test@example.com', password: 'testPassword' };

            jest.spyOn(authService, 'login').mockResolvedValueOnce({
                success: true,
                user: {},
                access_Token: 'mockedJwtToken',
                message: 'Looged In successfully!',
            });

            const result = await controller.login(loginDto);

            expect(result).toEqual({
                success: true,
                user: {},
                access_Token: 'mockedJwtToken',
                message: 'Looged In successfully!',
            });
            expect(authService.login).toHaveBeenCalledWith(loginDto);
        });

    });

    describe('signup', () => {
        it('should call authService.signup with the correct parameters', async () => {
            const signupDto = { emailId: 'test@example.com', password: 'testPassword', confirmPassword: 'testPassword' };

            jest.spyOn(authService, 'signup').mockResolvedValueOnce({
                success: true,
                message: 'Registered Successfully!',
            });

            const result = await controller.signup(signupDto);

            expect(result).toEqual({
                success: true,
                message: 'Registered Successfully!',
            });
            expect(authService.signup).toHaveBeenCalledWith(signupDto);
        });

    });
});
