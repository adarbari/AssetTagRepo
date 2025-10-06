/**
 * Notes Section
 *
 * Reusable component for job notes
 * Used in both CreateJob and EditJob components
 */

import React from &apos;react&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Textarea } from &apos;../ui/textarea&apos;;

interface NotesSectionProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export function NotesSection({ notes, onNotesChange }: NotesSectionProps) {
  return (
    <div className=&apos;space-y-6&apos;>
      <div>
        <h3>Additional Notes</h3>
        <p className=&apos;text-sm text-muted-foreground mt-2&apos;>
          Optional notes or special instructions
        </p>
      </div>

      <div className=&apos;space-y-2&apos;>
        <Label htmlFor=&apos;notes&apos;>Notes</Label>
        <Textarea
          id=&apos;notes&apos;
          placeholder=&apos;Any additional information about this job...&apos;
          value={notes}
          onChange={e => onNotesChange(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}
