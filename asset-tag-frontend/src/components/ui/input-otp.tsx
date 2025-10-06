&apos;use client&apos;;

import * as React from &apos;react&apos;;
import { OTPInput, OTPInputContext } from &apos;input-otp&apos;;
import { MinusIcon } from &apos;lucide-react&apos;;

import { cn } from &apos;./utils&apos;;

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot=&apos;input-otp&apos;
      containerClassName={cn(
        &apos;flex items-center gap-2 has-disabled:opacity-50&apos;,
        containerClassName
      )}
      className={cn(&apos;disabled:cursor-not-allowed&apos;, className)}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div
      data-slot=&apos;input-otp-group&apos;
      className={cn(&apos;flex items-center gap-1&apos;, className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<&apos;div&apos;> & {
  index: number;
}) {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot=&apos;input-otp-slot&apos;
      data-active={isActive}
      className={cn(
        &apos;data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm bg-input-background transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]&apos;,
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className=&apos;pointer-events-none absolute inset-0 flex items-center justify-center&apos;>
          <div className=&apos;animate-caret-blink bg-foreground h-4 w-px duration-1000&apos; />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<&apos;div&apos;>) {
  return (
    <div data-slot=&apos;input-otp-separator&apos; role=&apos;separator&apos; {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
