'use client';

import React from 'react';
import { WizardStepProps } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function CaseDetailsStep({ data, updateData, onNext }: WizardStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Case Details</CardTitle>
        <CardDescription>Enter the basic information about the probate case.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="caseTitle">Case Title / Reference</Label>
            <Input
              id="caseTitle"
              placeholder="e.g. Estate of John Doe"
              value={data.caseTitle}
              onChange={(e) => updateData({ caseTitle: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deceasedName">Deceased Name</Label>
              <Input
                id="deceasedName"
                value={data.deceasedName}
                onChange={(e) => updateData({ deceasedName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfDeath">Date of Death</Label>
              <Input
                id="dateOfDeath"
                type="date"
                value={data.dateOfDeath}
                onChange={(e) => updateData({ dateOfDeath: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseDescription">Description / Overview</Label>
            <Textarea
              id="caseDescription"
              placeholder="Briefly describe the situation..."
              className="min-h-[100px]"
              value={data.caseDescription}
              onChange={(e) => updateData({ caseDescription: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit">Next Step</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
