export type Vendor = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  logo_url: string;
  logo_path: string;
  created_at: string;
};

export type FormVendor = {
  name?: Vendor["name"][] | undefined;
  email?: Vendor["email"][] | undefined;
  address?: Vendor["address"][] | undefined;
  phoneNumber?: Vendor["phone_number"][] | undefined;
  logo?: Vendor["logo_url"][] | undefined;
};
