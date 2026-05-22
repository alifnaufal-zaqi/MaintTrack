type Report = {
  id: string;
  technician: string;
  trouble_date: string;
  status: string;

  assets: {
    asset_name: string;
    location: string;
  };
};
