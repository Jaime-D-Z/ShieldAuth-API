import { Prisma, Role, User } from '@prisma/client';
import { prisma } from '@/config/database';

export class UserRepository {
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  static async create(data: {
    email: string;
    password: string;
    name?: string;
    role?: Role;
  }): Promise<User> {
    return prisma.user.create({ data });
  }

  static async updateById(
    id: string,
    data: Prisma.UserUpdateInput
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async deleteById(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }
}