"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface OTPInputProps {
  value: string[]
  onChange: (value: string[]) => void
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export function OTPInput({
  value,
  onChange,
  length = 6,
  disabled = false,
  autoFocus = true,
  className,
}: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Auto-focus first input on mount
  React.useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index: number, inputValue: string) => {
    // Only accept digits
    const digit = inputValue.replace(/\D/g, "").slice(-1)

    const newValue = [...value]
    newValue[index] = digit
    onChange(newValue)

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus()
        const newValue = [...value]
        newValue[index - 1] = ""
        onChange(newValue)
      } else {
        // Clear current input
        const newValue = [...value]
        newValue[index] = ""
        onChange(newValue)
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)

    if (pastedData.length === 0) return

    const newValue = [...value]
    pastedData.split("").forEach((char, i) => {
      if (i < length) newValue[i] = char
    })
    onChange(newValue)

    // Focus the next empty input or the last one
    const nextEmptyIndex = newValue.findIndex((v) => !v)
    if (nextEmptyIndex !== -1 && nextEmptyIndex < length) {
      inputRefs.current[nextEmptyIndex]?.focus()
    } else {
      inputRefs.current[length - 1]?.focus()
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  return (
    <div className={cn("flex items-center justify-center gap-2 sm:gap-3", className)} onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <React.Fragment key={index}>
          <input
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={handleFocus}
            disabled={disabled}
            className={cn(
              "h-12 w-10 rounded-xl border-2 bg-muted/50 text-center text-xl font-bold transition-all",
              "focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "sm:h-14 sm:w-12 sm:text-2xl",
              value[index] ? "border-primary/50" : "border-border",
            )}
            aria-label={`Digit ${index + 1}`}
          />
          {index === 2 && <span className="mx-1 text-xl text-muted-foreground sm:mx-2">-</span>}
        </React.Fragment>
      ))}
    </div>
  )
}
