/**
 * Budget Section
 *
 * Reusable component for budget allocation fields
 * Used in both CreateJob and EditJob components
 */

import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { DollarSign } from 'lucide-react';

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
    <div className='space-y-6'>
      <div>
        <h3 className='flex items-center gap-2 mb-4'>
          <DollarSign className='h-5 w-5' />
          Budget Allocation
        </h3>
        <p className='text-sm text-muted-foreground mb-6'>
          Set the budget breakdown for this job
        </p>
      </div>

      <div className='space-y-2'>
        <Label htmlFor='total-budget'>Total Budget</Label>
        <div className='relative'>
          <DollarSign className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
          <Input
            id='total-budget'
            type='number'
            placeholder='0.00'
            value={totalBudget}
            onChange={e => onTotalBudgetChange(e.target.value)}
            className='pl-9'
            min='0'
            step='0.01'
          />
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='labor-budget'>Labor Budget</Label>
          <div className='relative'>
            <DollarSign className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
            <Input
              id='labor-budget'
              type='number'
              placeholder='0.00'
              value={laborBudget}
              onChange={e => onLaborBudgetChange(e.target.value)}
              className='pl-9'
              min='0'
              step='0.01'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='equipment-budget'>Equipment Budget</Label>
          <div className='relative'>
            <DollarSign className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
            <Input
              id='equipment-budget'
              type='number'
              placeholder='0.00'
              value={equipmentBudget}
              onChange={e => onEquipmentBudgetChange(e.target.value)}
              className='pl-9'
              min='0'
              step='0.01'
            />
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <div className='space-y-2'>
          <Label htmlFor='materials-budget'>Materials Budget</Label>
          <div className='relative'>
            <DollarSign className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
            <Input
              id='materials-budget'
              type='number'
              placeholder='0.00'
              value={materialsBudget}
              onChange={e => onMaterialsBudgetChange(e.target.value)}
              className='pl-9'
              min='0'
              step='0.01'
            />
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='other-budget'>Other Budget</Label>
          <div className='relative'>
            <DollarSign className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none' />
            <Input
              id='other-budget'
              type='number'
              placeholder='0.00'
              value={otherBudget}
              onChange={e => onOtherBudgetChange(e.target.value)}
              className='pl-9'
              min='0'
              step='0.01'
            />
          </div>
        </div>
      </div>
    </div>
  );
}
