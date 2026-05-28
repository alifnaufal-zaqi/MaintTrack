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
