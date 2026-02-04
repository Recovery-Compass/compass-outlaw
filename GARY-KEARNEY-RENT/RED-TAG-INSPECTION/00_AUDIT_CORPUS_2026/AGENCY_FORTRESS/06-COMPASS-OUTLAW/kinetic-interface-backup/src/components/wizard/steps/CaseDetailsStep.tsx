import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";

interface CaseDetailsStepProps {
  data: {
    caseName: string;
    hearingDate: string;
    opposingCounsel: string;
    keyObjectives: string;
  };
  onChange: (field: string, value: string) => void;
}

export const CaseDetailsStep = ({ data, onChange }: CaseDetailsStepProps) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Case Name Input */}
      <div className="space-y-2">
        <Label htmlFor="caseName" className="text-foreground/90">Case Name *</Label>
        <Input
          id="caseName"
          value={data.caseName}
          onChange={(e) => onChange("caseName", e.target.value)}
          placeholder="Estate of [Decedent Name]"
          className="mt-2 bg-background/50 border-input/50 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Hearing Date Input */}
      <div className="space-y-2">
        <Label htmlFor="hearingDate" className="text-foreground/90">Hearing Date *</Label>
        <div className="relative mt-2">
          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            id="hearingDate"
            type="date"
            value={data.hearingDate}
            onChange={(e) => onChange("hearingDate", e.target.value)}
            className="pl-10 bg-background/50 border-input/50"
          />
        </div>
      </div>

      {/* Opposing Counsel Input */}
      <div className="space-y-2">
        <Label htmlFor="opposingCounsel" className="text-foreground/90">Opposing Counsel</Label>
        <Input
          id="opposingCounsel"
          value={data.opposingCounsel}
          onChange={(e) => onChange("opposingCounsel", e.target.value)}
          placeholder="Attorney Name & Firm (e.g., Nicora Law)"
          className="mt-2 bg-background/50 border-input/50"
        />
      </div>

      {/* Missing Section: Key Objectives */}
      <div className="space-y-2">
        <Label htmlFor="keyObjectives" className="text-foreground/90">Key Objectives</Label>
        <Textarea
          id="keyObjectives"
          value={data.keyObjectives}
          onChange={(e) => onChange("keyObjectives", e.target.value)}
          placeholder="e.g. Stop Foreclosure (Dec 3), Recover Mercedes Proceeds..."
          className="mt-2 min-h-[100px] bg-background/50 border-input/50 resize-none"
        />
      </div>
    </div>
  );
};