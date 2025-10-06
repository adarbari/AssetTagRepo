&apos;use client&apos;;

import * as React from &apos;react&apos;;
import * as LabelPrimitive from &apos;@radix-ui/react-label&apos;;
import { Slot } from &apos;@radix-ui/react-slot&apos;;
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from &apos;react-hook-form&apos;;

import { cn } from &apos;./utils&apos;;
import { Label } from &apos;./label&apos;;

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error(&apos;useFormField should be used within <FormField>&apos;);
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

function FormItem({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot=&apos;form-item&apos;
        className={cn(&apos;grid gap-2&apos;, className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const { error, formItemId } = useFormField();

  return (
    <Label
      data-slot=&apos;form-label&apos;
      data-error={!!error}
      className={cn(&apos;data-[error=true]:text-destructive&apos;, className)}
      htmlFor={formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-slot=&apos;form-control&apos;
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<&apos;p&apos;>) {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-slot=&apos;form-description&apos;
      id={formDescriptionId}
      className={cn(&apos;text-muted-foreground text-sm&apos;, className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<&apos;p&apos;>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? &apos;&apos;) : props.children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot=&apos;form-message&apos;
      id={formMessageId}
      className={cn(&apos;text-destructive text-sm&apos;, className)}
      {...props}
    >
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};
