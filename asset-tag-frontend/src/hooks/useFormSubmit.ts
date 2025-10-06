import { useState } from 'react';
import { toast } from 'sonner';

interface FormSubmitOptions {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
  validate?: (data: any) => string | null; // Return error message or null
}

interface FormSubmitResult {
  success: boolean;
  error?: any;
}

export function useFormSubmit<T = any>(
  onSubmit: (data: T) => Promise<FormSubmitResult>,
  options: FormSubmitOptions = {}
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    onSuccess,
    onError,
    successMessage = 'Operation completed successfully',
    errorMessage = 'Operation failed',
    validate,
  } = options;

  const handleSubmit = async (data: T): Promise<FormSubmitResult> => {
    // Validation
    if (validate) {
      const validationError = validate(data);
      if (validationError) {
        toast.error(validationError);
        return { success: false, error: validationError };
      }
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit(data);

      if (result.success) {
        toast.success(successMessage);
        onSuccess?.();
        return { success: true };
      } else {
        toast.error(errorMessage);
        onError?.(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error(errorMessage);
      onError?.(error);
      return { success: false, error };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
  };
}
