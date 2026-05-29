export type Movement = {
  id: string;
  asset: {
    name: string;
    asset_image_url: string;
  };
  from_location: {
    name: string;
  };
  to_location: {
    name: string;
  };
  movement_date: string;
  pic: {
    fullname: string;
  };
  notes: string;
  created_at: string;
};

export type FormMovement = {
  fromLocation: string;
  toLocation: string;
  pic: string;
  notes: string | null;
};

export type MovementError = {
  fromLocation?: string[] | undefined;
  toLocation?: string[] | undefined;
  notes?: string[] | undefined;
};
