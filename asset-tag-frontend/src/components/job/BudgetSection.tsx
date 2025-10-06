/**
 * Budget Section
 *
 * Reusable component for budget allocation fields
 * Used in both CreateJob and EditJob components
 */

import React from &apos;react&apos;;
import { Label } from &apos;../ui/label&apos;;
import { Input } from &apos;../ui/input&apos;;
import { DollarSign } from &apos;lucide-react&apos;;

interface BudgetSectionProps {
  totalBudget: string;
  onTotalBudgetChange: (value: string) => void;
  laborBudget: string;
  onLaborBudgetChange: (value: string) => void;
  equipmentBudget: string;
  onEquipmentBudgetChange: (value: string) => void;
  materialsBudget: string;
  onMaterialsBudgetChange: (value: string) => void;
  otherBudget: string;
  onOtherBudgetChange: (value: string) => void;
}

export function BudgetSection({
  totalBudget,
  onTotalBudgetChange,
  laborBudget,
  onLaborBudgetChange,
  equipmentBudget,
  onEquipmentBudgetChange,
  materialsBudget,
  onMaterialsBudgetChange,
  otherBudget,
  onOtherBudgetChange,
}: BudgetSectionProps) {
  return (
    <div className=&apos;space-y-6&apos;>
      <div>
        <h3 className=&apos;flex items-center gap-2 mb-4&apos;>
          <DollarSign className=&apos;h-5 w-5&apos; />
          Budget Allocation
        </h3>
        <p className=&apos;text-sm text-muted-foreground mb-6&apos;>
          Set the budget breakdown for this job
        </p>
      </div>

      <div className=&apos;space-y-2&apos;>
        <Label htmlFor=&apos;total-budget&apos;>Total Budget</Label>
        <div className=&apos;relative&apos;>
          <DollarSign className=&apos;absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none&apos; />
          <Input
            id=&apos;total-budget&apos;
            type=&apos;number&apos;
            placeholder=&apos;0.00&apos;
            value={totalBudget}
            onChange={e => onTotalBudgetChange(e.target.value)}
            className=&apos;pl-9&apos;
            min=&apos;0&apos;
            step=&apos;0.01&apos;
          />
        </div>
      </div>

      <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
        <div className=&apos;space-y-2&apos;>
          <Label htmlFor=&apos;labor-budget&apos;>Labor Budget</Label>
          <div className=&apos;relative&apos;>
            <DollarSign className=&apos;absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none&apos; />
            <Input
              id=&apos;labor-budget&apos;
              type=&apos;number&apos;
              placeholder=&apos;0.00&apos;
              value={laborBudget}
              onChange={e => onLaborBudgetChange(e.target.value)}
              className=&apos;pl-9&apos;
              min=&apos;0&apos;
              step=&apos;0.01&apos;
            />
          </div>
        </div>

        <div className=&apos;space-y-2&apos;>
          <Label htmlFor=&apos;equipment-budget&apos;>Equipment Budget</Label>
          <div className=&apos;relative&apos;>
            <DollarSign className=&apos;absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none&apos; />
            <Input
              id=&apos;equipment-budget&apos;
              type=&apos;number&apos;
              placeholder=&apos;0.00&apos;
              value={equipmentBudget}
              onChange={e => onEquipmentBudgetChange(e.target.value)}
              className=&apos;pl-9&apos;
              min=&apos;0&apos;
              step=&apos;0.01&apos;
            />
          </div>
        </div>
      </div>

      <div className=&apos;grid gap-4 md:grid-cols-2&apos;>
        <div className=&apos;space-y-2&apos;>
          <Label htmlFor=&apos;materials-budget&apos;>Materials Budget</Label>
          <div className=&apos;relative&apos;>
            <DollarSign className=&apos;absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none&apos; />
            <Input
              id=&apos;materials-budget&apos;
              type=&apos;number&apos;
              placeholder=&apos;0.00&apos;
              value={materialsBudget}
              onChange={e => onMaterialsBudgetChange(e.target.value)}
              className=&apos;pl-9&apos;
              min=&apos;0&apos;
              step=&apos;0.01&apos;
            />
          </div>
        </div>

        <div className=&apos;space-y-2&apos;>
          <Label htmlFor=&apos;other-budget&apos;>Other Budget</Label>
          <div className=&apos;relative&apos;>
            <DollarSign className=&apos;absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none&apos; />
            <Input
              id=&apos;other-budget&apos;
              type=&apos;number&apos;
              placeholder=&apos;0.00&apos;
              value={otherBudget}
              onChange={e => onOtherBudgetChange(e.target.value)}
              className=&apos;pl-9&apos;
              min=&apos;0&apos;
              step=&apos;0.01&apos;
            />
          </div>
        </div>
      </div>
    </div>
  );
}
