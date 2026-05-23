type Report = {
  id: string;
  technician: string;
  terakhir_perawatan: string;
  status: string;

  assets: {
    asset_name: string;
    location: string;
  };
};
