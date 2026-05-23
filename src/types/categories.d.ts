export type Category = {
  id: string;
  name: string;
  created_at: string;
};

export type FormCategory = {
  name?: Category["name"][];
};
