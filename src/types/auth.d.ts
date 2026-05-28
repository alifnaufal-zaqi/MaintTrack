import type { User } from "./users";

export type Profile = {
  id: string;
  userId: User["user_id"];
  fullname: string;
  phoneNumber: string;
  address: string;
  photoProfileUrl: string;
  photoProfilePath: string;
  role: "admin" | "operator";
  createdAt: User["created_at"];
} & Pick<User, "email">;

export type AuthError = {
  email?: string[];
  password?: string[];
};

export type ProfileError = {
  fullname?: string[] | undefined;
  email?: string[] | undefined;
  phone?: string[] | undefined;
  address?: string[] | undefined;
};
