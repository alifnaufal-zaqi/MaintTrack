export type Location = {
  id: string;
  name: string;
  type: string;
  description: string;
  created_at: string;
};

export type FormLocation = {
  name?: Location["name"][] | undefined;
  description?: Location["description"][] | undefined;
  type?: Location["type"][] | undefined;
};
