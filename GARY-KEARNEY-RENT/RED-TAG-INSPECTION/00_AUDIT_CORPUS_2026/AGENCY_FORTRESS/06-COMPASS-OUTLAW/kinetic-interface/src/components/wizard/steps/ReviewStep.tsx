'use client';

import React from 'react';
import { WizardStepProps } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Copy } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export function ReviewStep({ data, onBack }: WizardStepProps) {
  const handleFinalSubmit = () => {
    console.log('Final Data Submitted:', data);
    alert('Case successfully saved! (Check console for data)');
  };

  const generateDraft = () => {
    if (data.strategyType === 'pro-per-assertion') {
      return `Subject: RE: Estate of ${data.deceasedName || '[Deceased Name]'} - Notice of Representation

Dear Ms. Nicora,

Please be advised that Anuar Ramirez-Medina has withdrawn as counsel in this matter. Effective immediately, I, Eric Jones, am appearing Pro Per (representing myself) in my capacity as Trustee/Co-Executor.

I am in receipt of your recent communications. I formally request a file-stamped copy of the "Petition for Probate" you have filed.

Furthermore, I reaffirm my intent to administer the ${data.deceasedName || 'Subject'} Trust out of court, as is my right and duty under the Trust instrument.

Please direct all future correspondence to me at this email address.

Sincerely,

Eric Jones
Trustee / Pro Per litigant`;
    }
    return "No specific draft template available for this strategy yet.";
  };

  const copyToClipboard = () => {
    const text = generateDraft();
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Review Case</CardTitle>
        <CardDescription>Please review the information before finalizing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4 space-y-4 bg-muted/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Case Title</h4>
                <p>{data.caseTitle || 'N/A'}</p>
             </div>
             <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Deceased</h4>
                <p>{data.deceasedName || 'N/A'}</p>
             </div>
             <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Date of Death</h4>
                <p>{data.dateOfDeath || 'N/A'}</p>
             </div>
             <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Strategy</h4>
                <p className="capitalize">{data.strategyType?.replace(/-/g, ' ')}</p>
             </div>
             {data.opposingCounselEmail && (
               <div className="md:col-span-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">Opposing Counsel</h4>
                  <p>{data.opposingCounselEmail}</p>
               </div>
             )}
          </div>
          
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground">Description</h4>
            <p className="whitespace-pre-wrap text-sm">{data.caseDescription || 'No description provided.'}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-muted-foreground">Key Evidence</h4>
            <p className="whitespace-pre-wrap text-sm">{data.keyEvidence || 'No evidence listed.'}</p>
          </div>
          
           <div>
            <h4 className="font-semibold text-sm text-muted-foreground">Notes</h4>
            <p className="whitespace-pre-wrap text-sm">{data.notes || 'No notes.'}</p>
          </div>
        </div>

        {/* Generated Correspondence Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Generated Correspondence</h3>
            <Button size="sm" variant="outline" onClick={copyToClipboard} className="gap-2">
              <Copy className="w-4 h-4" />
              Copy
            </Button>
          </div>
          <Textarea 
            className="min-h-[200px] font-mono text-sm bg-background"
            readOnly
            value={generateDraft()}
          />
        </div>

      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleFinalSubmit} className="gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Submit Case
        </Button>
      </CardFooter>
    </Card>
  );
}