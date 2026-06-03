import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

type StatisticCardProps = {
  label: string;
  data: number;
  icon: { name: LucideIcon; color: string };
};

export function StatisticCard({ data, label, icon }: StatisticCardProps) {
  return (
    <Card>
      <div className="flex flex-row gap-2 items-center px-4">
        <div className={`p-2 ${icon.color} h-fit rounded-md`}>
          <icon.name className="size-6" />
        </div>
        <div className="grow">
          <CardHeader>
            <CardTitle className="text-muted-foreground">{label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data}</p>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
