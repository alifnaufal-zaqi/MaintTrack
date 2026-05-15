export type Profile = {
  id: string;
  fullname: string;
  phoneNumber: string;
  address: string;
  photoProfileUrl: string;
  role: "admin" | "operator";
};
