/**
 * User repository for data access operations.
 */

import { prisma } from '@/lib/db/prisma'
import { User } from '@prisma/client'

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  }

  async create(email: string, name: string, passwordHash: string, role: string = 'SUBMITTER'): Promise<User> {
    return prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        passwordHash,
        role,
      },
    })
  }

  async updateRole(userId: string, role: string): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { role },
    })
  }
}

export const userRepository = new UserRepository()
