/**
 * Tags Section
 * 
 * Reusable component for managing job tags
 * Used in both CreateJob and EditJob components
 */

import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Plus, X, Tag } from "lucide-react";
import { toast } from "sonner";

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
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (!newTag.trim()) {
      toast.error("Please enter a tag");
      return;
    }

    if (tags.includes(newTag.trim())) {
      toast.error("Tag already exists");
      return;
    }

    onTagsChange([...tags, newTag.trim()]);
    setNewTag("");
    setShowTagDialog(false);
    toast.success("Tag added");
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter(t => t !== tag));
  };

  const content = (
    <div className="space-y-2">
      <Label>Tags</Label>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary">
            {tag}
            <X
              className="h-3 w-3 ml-1 cursor-pointer"
              onClick={() => handleRemoveTag(tag)}
            />
          </Badge>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTagDialog(true)}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Tag
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {showAsSection ? (
        <div className="space-y-6">
          <div>
            <h3 className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
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

          <div className="space-y-2">
            <Label htmlFor="new-tag">Tag Name</Label>
            <Input
              id="new-tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g., urgent, high-value, downtown"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTagDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTag}>
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
