'use client';

import React from 'react';
import { WizardStepProps } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function StrategyEvidenceStep({ data, updateData, onNext, onBack }: WizardStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Strategy & Evidence</CardTitle>
        <CardDescription>Define your legal strategy and available evidence.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="strategyType">Primary Legal Strategy</Label>
            <div className="relative">
              <select
                id="strategyType"
                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                value={data.strategyType}
                onChange={(e) => updateData({ strategyType: e.target.value as any })}
              >
                <option value="will-contest">Will Contest</option>
                <option value="undue-influence">Undue Influence</option>
                <option value="capacity">Lack of Capacity</option>
                <option value="breach-of-fiduciary">Breach of Fiduciary Duty</option>
                <option value="pro-per-assertion">Pro Per Representation Assertion</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="opposingCounselEmail">Attorney Communication (Email)</Label>
            <Input
              id="opposingCounselEmail"
              placeholder="attorney@lawfirm.com"
              value={data.opposingCounselEmail}
              onChange={(e) => updateData({ opposingCounselEmail: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyEvidence">Key Evidence</Label>
            <Textarea
              id="keyEvidence"
              placeholder="List key documents, witnesses, or facts..."
              className="min-h-[150px]"
              value={data.keyEvidence}
              onChange={(e) => updateData({ keyEvidence: e.target.value })}
            />
          </div>

           <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any other relevant details..."
              className="min-h-[100px]"
              value={data.notes}
              onChange={(e) => updateData({ notes: e.target.value })}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">Next Step</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}