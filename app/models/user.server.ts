import bcrypt from "bcryptjs";

import { db } from "~/db.server";

export interface User {
  id: string;
  email: string;
  is_admin: boolean;
}

export async function getUserById(id: string): Promise<User | undefined> {
  return await db
    .selectFrom("users")
    .select(["id", "email", "is_admin"])
    .where("id", "=", id)
    .executeTakeFirstOrThrow();
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return await db
    .selectFrom("users")
    .select(["id", "email", "is_admin"])
    .where("email", "=", email)
    .executeTakeFirst();
}

export async function createUser(
  email: string,
  password: string,
): Promise<User> {
  const hash = await bcrypt.hash(password, 10);

  return db
    .insertInto("users")
    .columns(["email", "hash"])
    .values({ email, hash })
    .returning(["id", "email", "is_admin"])
    .executeTakeFirstOrThrow();
}

export async function deleteUserByEmail(email: string) {
  // return await db.deletes("users", { email }, { returning: [] }).run(pool);
  return await db.deleteFrom("users").where("email", "=", email).execute();
}

export async function verifyLogin(email: string, password: string) {
  // const userWithPassword = await db.selectOne('users', { email }).run(pool)
  const userWithPassword = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirstOrThrow();

  if (!userWithPassword || !userWithPassword.hash) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.hash);

  if (!isValid) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { hash: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
