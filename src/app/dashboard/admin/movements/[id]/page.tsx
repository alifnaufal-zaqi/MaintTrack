import { MovementDetail } from "../_ui/movement-detail";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return <MovementDetail id={id} />;
}
