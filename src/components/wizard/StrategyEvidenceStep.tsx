import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EvidenceFile {
  id: string;
  name: string;
  linkedParagraph?: string;
}

interface StrategyEvidenceStepProps {
  data: {
    strategy: "aggressive" | "collaborative";
    evidenceFiles: EvidenceFile[];
  };
  onChange: (field: string, value: any) => void;
}

export const StrategyEvidenceStep = ({ data, onChange }: StrategyEvidenceStepProps) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: EvidenceFile[] = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
      }));
      onChange("evidenceFiles", [...data.evidenceFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (id: string) => {
    onChange(
      "evidenceFiles",
      data.evidenceFiles.filter((f) => f.id !== id)
    );
  };

  const handleLinkParagraph = (id: string, paragraph: string) => {
    onChange(
      "evidenceFiles",
      data.evidenceFiles.map((f) => (f.id === id ? { ...f, linkedParagraph: paragraph } : f))
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label className="text-base font-semibold">Filing Strategy</Label>
        <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
          <div className="flex-1">
            <p className="font-medium">
              {data.strategy === "aggressive" ? "Aggressive" : "Collaborative"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {data.strategy === "aggressive"
                ? "Assert your position with strong legal arguments"
                : "Seek mutual agreement and compromise solutions"}
            </p>
          </div>
          <Switch
            checked={data.strategy === "aggressive"}
            onCheckedChange={(checked) =>
              onChange("strategy", checked ? "aggressive" : "collaborative")
            }
            className="ml-4"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base font-semibold">Evidence Mapper</Label>
        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Upload Evidence Files</p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOC, or image files
            </p>
          </label>
        </div>

        {data.evidenceFiles.length > 0 && (
          <div className="space-y-3 mt-4">
            {data.evidenceFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-start gap-3 p-3 border rounded-lg bg-card"
              >
                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      placeholder="Link to paragraph # (optional)"
                      value={file.linkedParagraph || ""}
                      onChange={(e) => handleLinkParagraph(file.id, e.target.value)}
                      className="h-8 text-xs"
                    />
                    {file.linkedParagraph && (
                      <Badge variant="secondary" className="shrink-0">
                        <LinkIcon className="w-3 h-3 mr-1" />¶{file.linkedParagraph}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(file.id)}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
