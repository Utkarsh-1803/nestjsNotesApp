import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { NotAcceptableException } from '@nestjs/common';
import { User } from '../schemas';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                JwtService,
                {
                    provide: getModelToken('User'),
                    useValue: {
                        findOne: jest.fn(),
                        findOneAndUpdate: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('signup', () => {
        it('should successfully register a user', async () => {
            const mockUserData = {
                emailId: 'test@example.com',
                password: 'testPassword',
                confirmPassword: 'testPassword',
            };

            jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(service['userModel'], 'findOneAndUpdate').mockResolvedValueOnce(
                mockUserData as any,
            );

            jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashedPassword');

            const result = await service.signup(mockUserData);

            expect(result).toEqual({
                success: true,
                message: 'Registered Successfully!',
            });
        });

        it('should throw NotAcceptableException if passwords do not match', async () => {
            const mockUserData = {
                emailId: 'test@example.com',
                password: 'testPassword',
                confirmPassword: 'differentPassword',
            };

            await expect(service.signup(mockUserData)).rejects.toThrow(
                NotAcceptableException,
            );
        });

        it('should throw NotAcceptableException if emailId already exists', async () => {
            const mockUserData = {
                emailId: 'test@example.com',
                password: 'testPassword',
                confirmPassword: 'testPassword',
            };

            jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce(mockUserData as any);


            await expect(service.signup(mockUserData)).rejects.toThrow(
                NotAcceptableException,
            );
        });

        it('should throw NotAcceptableException if something goes wrong', async () => {
            const mockUserData = {
                emailId: 'test@example.com',
                password: 'testPassword',
                confirmPassword: 'testPassword',
            };
            

            const findOneMock = jest
                .spyOn(service['userModel'], 'findOne')
                .mockResolvedValueOnce(null);
            const findOneAndUpdateMock = jest
                .spyOn(service['userModel'], 'findOneAndUpdate')
                .mockRejectedValueOnce(new Error());

            jest.spyOn(bcrypt, 'hash').mockResolvedValueOnce('hashedPassword');

            await expect(service.signup(mockUserData)).rejects.toThrow();

            // Additional cleanup to avoid potential side effects
            findOneMock.mockRestore();
            findOneAndUpdateMock.mockRestore();
        });
    });

    describe('login', () => {
        it('should successfully log in a user with correct credentials', async () => {
            const mockUserData = {
                emailId: 'test@example.com',
                password: 'hashedPassword', // Simulating a hashed password
            };

            jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce(mockUserData as any);

            jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true); // Simulating a successful password comparison

            jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce('mockedJwtToken');

            const result = await service.login({
                emailId: 'test@example.com',
                password: 'actualPassword', // Actual password before hashing
            });

            expect(result).toEqual({
                success: true,
                user: mockUserData,
                access_Token: 'mockedJwtToken',
                message: 'Looged In successfully!',
            });
        });

        it('should throw NotAcceptableException if user is not found', async () => {
            jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce(null);

            await expect(
                service.login({
                    emailId: 'nonexistent@example.com',
                    password: 'anyPassword',
                }),
            ).rejects.toThrow(NotAcceptableException);
        });

        it('should throw NotAcceptableException if password is incorrect', async () => {
            const mockUserData = {
                emailId: 'test@example.com',
                password: 'hashedPassword', // Simulating a hashed password
            };

            jest.spyOn(service['userModel'], 'findOne').mockResolvedValueOnce(mockUserData as any);

            jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false); // Simulating a failed password comparison

            await expect(
                service.login({
                    emailId: 'test@example.com',
                    password: 'incorrectPassword',
                }),
            ).rejects.toThrow(NotAcceptableException);
        });

        it('should throw an error if something goes wrong during login', async () => {
            jest.spyOn(service['userModel'], 'findOne').mockRejectedValueOnce(new Error('Database error'));

            await expect(
                service.login({
                    emailId: 'test@example.com',
                    password: 'anyPassword',
                }),
            ).rejects.toThrow();
        });
    });
});
