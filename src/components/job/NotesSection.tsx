/**
 * Notes Section
 * 
 * Reusable component for job notes
 * Used in both CreateJob and EditJob components
 */

import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface NotesSectionProps {
  notes: string;
  onNotesChange: (value: string) => void;
}

export function NotesSection({
  notes,
  onNotesChange,
}: NotesSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3>Additional Notes</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Optional notes or special instructions
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional information about this job..."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
}
