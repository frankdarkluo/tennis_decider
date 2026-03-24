import { Card } from "@/components/ui/Card";

export function DrillSuggestions({ drills }: { drills: string[] }) {
  return (
    <Card className="space-y-2">
      <h3 className="text-lg font-bold text-slate-900">训练建议</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
        {drills.slice(0, 3).map((drill) => (
          <li key={drill}>{drill}</li>
        ))}
      </ul>
    </Card>
  );
}
