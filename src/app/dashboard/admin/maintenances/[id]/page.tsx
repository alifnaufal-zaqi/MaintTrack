import { MaintenanceDetail } from "../_ui/maintenance-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const {id} = await params;
  
  return <MaintenanceDetail id={id} />;
}
