import { Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex min-h-56 flex-col items-center justify-center gap-3 text-center">
        <Inbox className="h-8 w-8 text-muted-foreground" />
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-normal">{title}</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
