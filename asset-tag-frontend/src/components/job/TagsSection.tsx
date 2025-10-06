/**
 * Tags Section
 *
 * Reusable component for managing job tags
 * Used in both CreateJob and EditJob components
 */

import React, { useState } from &apos;react&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Input } from &apos;../ui/input&apos;;
import { Button } from &apos;../ui/button&apos;;
import { Badge } from &apos;../ui/badge&apos;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from &apos;../ui/dialog&apos;;
import { Plus, X, Tag } from &apos;lucide-react&apos;;
import { toast } from &apos;sonner&apos;;

interface TagsSectionProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  showAsSection?: boolean; // Whether to show as a full section with header
}

export function TagsSection({
  tags,
  onTagsChange,
  showAsSection = true,
}: TagsSectionProps) {
  const [showTagDialog, setShowTagDialog] = useState(false);
  const [newTag, setNewTag] = useState(&apos;&apos;);

  const handleAddTag = () => {
    if (!newTag.trim()) {
      toast.error(&apos;Please enter a tag&apos;);
      return;
    }

    if (tags.includes(newTag.trim())) {
      toast.error(&apos;Tag already exists&apos;);
      return;
    }

    onTagsChange([...tags, newTag.trim()]);
    setNewTag(&apos;&apos;);
    setShowTagDialog(false);
    toast.success(&apos;Tag added&apos;);
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter(t => t !== tag));
  };

  const content = (
    <div className=&apos;space-y-2&apos;>
      <Label>Tags</Label>
      <div className=&apos;flex flex-wrap gap-2&apos;>
        {tags.map(tag => (
          <Badge key={tag} variant=&apos;secondary&apos;>
            {tag}
            <X
              className=&apos;h-3 w-3 ml-1 cursor-pointer&apos;
              onClick={() => handleRemoveTag(tag)}
            />
          </Badge>
        ))}
        <Button
          variant=&apos;outline&apos;
          size=&apos;sm&apos;
          onClick={() => setShowTagDialog(true)}
        >
          <Plus className=&apos;h-3 w-3 mr-1&apos; />
          Add Tag
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {showAsSection ? (
        <div className=&apos;space-y-6&apos;>
          <div>
            <h3 className=&apos;flex items-center gap-2&apos;>
              <Tag className=&apos;h-5 w-5&apos; />
              Tags
            </h3>
            <p className=&apos;text-sm text-muted-foreground mt-2&apos;>
              Add tags to organize and categorize this job
            </p>
          </div>
          {content}
        </div>
      ) : (
        content
      )}

      {/* Add Tag Dialog */}
      <Dialog open={showTagDialog} onOpenChange={setShowTagDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tag</DialogTitle>
            <DialogDescription>
              Enter a tag to help categorize this job
            </DialogDescription>
          </DialogHeader>

          <div className=&apos;space-y-2&apos;>
            <Label htmlFor=&apos;new-tag&apos;>Tag Name</Label>
            <Input
              id=&apos;new-tag&apos;
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              placeholder=&apos;e.g., urgent, high-value, downtown&apos;
              onKeyDown={e => {
                if (e.key === &apos;Enter&apos;) {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button variant=&apos;outline&apos; onClick={() => setShowTagDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTag}>Add Tag</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
