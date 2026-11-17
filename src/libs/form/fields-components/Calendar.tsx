import {
  Calendar as CalendarBase,
  CalendarProps as CalendarBaseProps,
} from '@app/ui/components/Primitives/calendar/Calendar'
import { useFieldContext } from '@app/web/libs/form/form-context'

type ValuePiece = Date | null
type Value = ValuePiece | [ValuePiece, ValuePiece]

type CalendarProps = Omit<CalendarBaseProps, 'id' | 'name'> & {
  isPending: boolean
}

export const Calendar = (props: CalendarProps) => {
  const { state, handleChange } = useFieldContext<Date | null>()

  const onDateChange = (value: Value) => {
    !value || Array.isArray(value) ? handleChange(null) : handleChange(value)
  }

  return <CalendarBase value={state.value} onChange={onDateChange} {...props} />
}
