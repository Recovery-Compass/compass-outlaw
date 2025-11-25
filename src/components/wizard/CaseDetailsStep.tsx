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
    <div className="space-y-6">
      <div>
        <Label htmlFor="caseName" className="text-base font-semibold">
          Case Name *
        </Label>
        <Input
          id="caseName"
          value={data.caseName}
          onChange={(e) => onChange("caseName", e.target.value)}
          placeholder="Estate of [Decedent Name]"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="hearingDate" className="text-base font-semibold">
          Hearing Date *
        </Label>
        <div className="relative mt-2">
          <Input
            id="hearingDate"
            type="date"
            value={data.hearingDate}
            onChange={(e) => onChange("hearingDate", e.target.value)}
            className="pl-10"
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div>
        <Label htmlFor="opposingCounsel" className="text-base font-semibold">
          Opposing Counsel
        </Label>
        <Input
          id="opposingCounsel"
          value={data.opposingCounsel}
          onChange={(e) => onChange("opposingCounsel", e.target.value)}
          placeholder="Attorney Name & Firm"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="keyObjectives" className="text-base font-semibold">
          Key Objectives *
        </Label>
        <Textarea
          id="keyObjectives"
          value={data.keyObjectives}
          onChange={(e) => onChange("keyObjectives", e.target.value)}
          placeholder="Describe your primary goals for this filing..."
          rows={5}
          className="mt-2 resize-none"
        />
      </div>
    </div>
  );
};
