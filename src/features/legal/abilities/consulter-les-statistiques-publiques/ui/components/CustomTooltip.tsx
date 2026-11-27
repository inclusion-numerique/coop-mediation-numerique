import type { TooltipContentProps } from 'recharts'
import type {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent'
import { onlyDefinedAndNotNull } from '@/libraries/collections'
import { numberToString } from '@/libraries/nombre'

const CustomTooltip = ({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: TooltipContentProps<ValueType, NameType>) => {
  if (active && payload && payload.length > 0) {
    const title = labelFormatter ? labelFormatter(label, payload) : label

    return (
      <div className="infobulle-de-graphique">
        <p className="infobulle-de-graphique__titre">{title}</p>
        {payload.map((item, index) => {
          const formatedName = formatter
            ? formatter(item.value, item.name, item, index, payload)
            : item.name

          return (
            <p key={item.name} className="infobulle-de-graphique__serie">
              {onlyDefinedAndNotNull(formatedName) ? (
                <span>
                  {formatter
                    ? formatter(item.value, item.name, item, index, payload)
                    : item.name}
                </span>
              ) : null}
              <span className="fr-text--bold">
                {typeof item.value === 'number'
                  ? numberToString(item.value)
                  : item.value}
              </span>
            </p>
          )
        })}
      </div>
    )
  }

  return null
}

export default CustomTooltip
