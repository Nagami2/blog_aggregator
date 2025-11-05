// src/db/queries/users.ts
import { db } from '..';
import { users } from '../../schema';
import { eq } from 'drizzle-orm';

// This is the query from the lesson
export async function createUser(name: string) {
  const [result] = await db
    .insert(users)
    .values({
      name: name,
    })
    .returning(); // This returns the full user object

  return result;
}

// This is the new query you need for the 'login' command
export async function getUserByName(name: string) {
  // .findFirst() is a Drizzle-Kit feature, but this is the
  // Drizzle-ORM way.
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.name, name));

  return user;

}

// add the deleteAllUsers query
export async function deleteAllUsers() {
  await db.delete(users);
}

// add the getAllUsers query
export async function getAllUsers() {
  const allUsers = await db.select().from(users);
  return allUsers;
}