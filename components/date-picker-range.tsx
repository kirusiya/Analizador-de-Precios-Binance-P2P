"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import type { Locale } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string
  dateRange: DateRange
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>
  locale?: Locale
}

export function DatePickerWithRange({ className, dateRange, setDateRange, locale = es }: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false)

  // Añadir una función para manejar el clic con logs
  const handleButtonClick = () => {
    console.log("DatePicker: Botón clickeado")
    console.log("DatePicker: Estado actual del popover:", open)
    try {
      console.log("DatePicker: Intentando abrir el popover")
      setOpen(true)
      console.log("DatePicker: Estado después de setOpen(true):", true)
    } catch (error) {
      console.error("DatePicker: Error al abrir el popover:", error)
    }
  }

  // Añadir una función para manejar el cambio de estado del popover
  const handleOpenChange = (newOpen: boolean) => {
    console.log("DatePicker: Popover onOpenChange llamado con:", newOpen)
    setOpen(newOpen)
  }

  console.log("DatePicker: Renderizando con estado open =", open)

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
            onClick={handleButtonClick}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "dd/MM/yyyy", { locale })} - {format(dateRange.to, "dd/MM/yyyy", { locale })}
                </>
              ) : (
                format(dateRange.from, "dd/MM/yyyy", { locale })
              )
            ) : (
              <span>Selecciona un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={(range) => {
              console.log("DatePicker: Selección de fecha:", range)
              setDateRange(range || { from: new Date(), to: undefined })
              if (range?.to) {
                console.log("DatePicker: Cerrando popover después de selección completa")
                setOpen(false)
              }
            }}
            numberOfMonths={2}
            locale={locale}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
