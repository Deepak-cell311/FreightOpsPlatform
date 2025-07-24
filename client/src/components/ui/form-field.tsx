import { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  success?: boolean;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  className?: string;
  hint?: string;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    custom?: (value: string) => string | null;
  };
  children?: ReactNode;
}

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  required,
  disabled,
  rows,
  className,
  hint,
  validation,
  children,
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const isTextarea = type === "textarea";
  const isPassword = type === "password";
  const displayType = isPassword && showPassword ? "text" : type;

  // Real-time validation
  useEffect(() => {
    if (isDirty && validation && value) {
      let validationError: string | null = null;

      if (validation.pattern && !validation.pattern.test(value)) {
        validationError = getPatternErrorMessage(validation.pattern);
      } else if (validation.minLength && value.length < validation.minLength) {
        validationError = `Must be at least ${validation.minLength} characters`;
      } else if (validation.maxLength && value.length > validation.maxLength) {
        validationError = `Must not exceed ${validation.maxLength} characters`;
      } else if (validation.custom) {
        validationError = validation.custom(value);
      }

      setInternalError(validationError);
    } else if (!value && isDirty && required) {
      setInternalError(`${label} is required`);
    } else {
      setInternalError(null);
    }
  }, [value, isDirty, validation, required, label]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (!isDirty) setIsDirty(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!isDirty) setIsDirty(true);
    onBlur?.();
  };

  const displayError = error || internalError;
  const isValid = success || (isDirty && !displayError && value);

  const getPatternErrorMessage = (pattern: RegExp): string => {
    const patternStr = pattern.toString();
    if (patternStr.includes("@")) return "Please enter a valid email address";
    if (patternStr.includes("\\d")) return "Must contain at least one number";
    if (patternStr.includes("[A-Z]")) return "Must contain at least one uppercase letter";
    return "Invalid format";
  };

  const InputComponent = isTextarea ? Textarea : Input;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={name}
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            isFocused && "text-primary-600",
            displayError && "text-red-600",
            isValid && "text-green-600"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {hint && !displayError && (
          <span className="text-xs text-gray-500">{hint}</span>
        )}
      </div>

      <div className="relative">
        <InputComponent
          id={name}
          name={name}
          type={displayType}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          disabled={disabled}
          rows={rows}
          className={cn(
            "transition-all duration-200 ease-in-out",
            "focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500",
            isFocused && "transform scale-[1.01] shadow-sm",
            displayError && "border-red-300 focus:border-red-500 focus:ring-red-500/20",
            isValid && "border-green-300 focus:border-green-500 focus:ring-green-500/20",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}

        {/* Validation icon */}
        {(displayError || isValid) && !isPassword && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {displayError ? (
              <AlertCircle className="h-4 w-4 text-red-500 animate-in fade-in-0 duration-200" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500 animate-in fade-in-0 duration-200" />
            )}
          </div>
        )}

        {children}
      </div>

      {/* Error message with animation */}
      <div className="min-h-[1.25rem]">
        {displayError && (
          <p className="text-sm text-red-600 animate-in slide-in-from-top-1 duration-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {displayError}
          </p>
        )}
        {isValid && !displayError && isDirty && (
          <p className="text-sm text-green-600 animate-in slide-in-from-top-1 duration-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3 flex-shrink-0" />
            Looks good!
          </p>
        )}
      </div>
    </div>
  );
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  dotNumber: /^\d{1,8}$/,
  mcNumber: /^(MC-)?[A-Z0-9]+$/i,
  zipCode: /^\d{5}(-\d{4})?$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  currency: /^\d+(\.\d{1,2})?$/,
  percentage: /^(\d{1,2}(\.\d{1,2})?|100(\.00?)?)$/,
};

// Custom validation functions
export const validationRules = {
  confirmPassword: (password: string) => (value: string) =>
    value !== password ? "Passwords do not match" : null,
    
  minAge: (minAge: number) => (value: string) => {
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age < minAge ? `Must be at least ${minAge} years old` : null;
  },
  
  futureDate: (value: string) => {
    const date = new Date(value);
    const today = new Date();
    return date <= today ? "Date must be in the future" : null;
  },
  
  businessHours: (value: string) => {
    const [hours, minutes] = value.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    if (totalMinutes < 360 || totalMinutes > 1080) { // 6 AM to 6 PM
      return "Must be between 6:00 AM and 6:00 PM";
    }
    return null;
  },
};