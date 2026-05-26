export type User = {
  id: string;
  fullname: string;
  email: string;
  phone_number: string;
  password: string;
  role: string;
  address: string;
  photo_profile_url?: string;
  created_at?: string;
};

export type FormUser = {
  fullname?: string[];
  email?: string[];
  phone_number?: string[];
  password?: string[];
  role?: string[];
  address?: string[];
};
