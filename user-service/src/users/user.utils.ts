import { User } from "@prisma/client";

export const sanitizeUser = (user: User): User => {
    const { password, ...rest } = user
    return rest as User
}