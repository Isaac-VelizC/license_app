import * as React from "react";
import PhoneNumberInput, {
    isValidPhoneNumber,
    type Value,
} from "react-phone-number-input";
import type { Country } from "react-phone-number-input";

import "react-phone-number-input/style.css";

import { cn } from "@/lib/utils";
import InputError from "../input-error";

const ALLOWED_COUNTRIES: Country[] = ["BO", "PE", "BR", "CL", "AR", "PY"];

export interface PhoneInputProps {
    value?: string | null;
    onChange: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    error?: string;
    id?: string;
    name?: string;
    className?: string;
}

export function PhoneInput({
    value,
    onChange,
    disabled = false,
    required = false,
    placeholder = "Número de teléfono",
    error,
    id,
    name,
    className,
}: PhoneInputProps) {
    const errorId = error && id ? `${id}-error` : undefined;

    return (
        <div className={cn("w-full", className)}>
            <PhoneNumberInput
                id={id}
                name={name}
                international
                countryCallingCodeEditable={false}
                defaultCountry="BO"
                countries={ALLOWED_COUNTRIES}
                value={(value || undefined) as Value | undefined}
                onChange={(nextValue) => onChange(nextValue ?? "")}
                disabled={disabled}
                required={required}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
                className={cn(
                    "flex min-h-8 w-full items-center gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-colors",
                    "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
                    "has-disabled:cursor-not-allowed has-disabled:opacity-50",
                    error
                        ? "border-destructive focus-within:ring-destructive/20"
                        : "border-input",
                )}
                numberInputProps={{
                    className:
                        "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
                    "aria-label": "Número de teléfono",
                }}
            />

            {error && (
                <InputError message={error} />
            )}
        </div>
    );
}

export { isValidPhoneNumber };
