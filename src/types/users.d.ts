export type User = {
  id: string;
  user_id: string;
  fullname: string;
  email: string;
  phone_number: string;
  password: string;
  role: string;
  address: string;
  photo_profile_url: string;
  created_at: string;
};

export type FormUser = {
  fullname?: string[] | undefined;
  email?: string[] | undefined;
  password?: string[] | undefined;
  role?: string[] | undefined;
};

export type ResetPasswordError = {
  newPassword?: string[] | undefined;
  confirmPassword?: string[] | undefined;
};
