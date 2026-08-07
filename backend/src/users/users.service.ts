import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from 'generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async findOrCreateGoogleUser(
    googleId: string,
    email: string,
    name: string,
  ): Promise<User> {
    let user = await this.prisma.user.findUnique({ where: { email } });
    
    if (user) {
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, isEmailVerified: true },
        });
      }
      return user;
    }

    return this.prisma.user.create({
      data: {
        email,
        name,
        googleId,
        authProvider: 'GOOGLE',
        role: 'CUSTOMER', // Default to CUSTOMER for google oauth
        isEmailVerified: true,
        phone: '', // Google does not provide phone reliably, we'll keep it empty or require it later
      },
    });
  }
}

