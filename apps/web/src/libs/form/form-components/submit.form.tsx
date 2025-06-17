import { buttonLoadingClassname } from '@app/ui/utils/buttonLoadingClassname'
import Button, {
  ButtonProps as BaseButtonProps,
} from '@codegouvfr/react-dsfr/Button'
import { ReactNode, type RefAttributes } from 'react'

type CustomButtonProps = BaseButtonProps.Common &
  (
    | BaseButtonProps.IconOnly
    | BaseButtonProps.WithIcon
    | BaseButtonProps.WithoutIcon
  ) &
  (BaseButtonProps.AsButton & RefAttributes<HTMLButtonElement>)

type ButtonProps = Omit<CustomButtonProps, 'type'> & {
  isPending: boolean
  children: ReactNode
}

const isIconOnly = (
  props: Partial<CustomButtonProps>,
): props is BaseButtonProps.IconOnly =>
  props.children == null &&
  props.title != null &&
  props.iconId != null &&
  props.iconPosition == null

const isWithIcon = (
  props: Partial<CustomButtonProps>,
): props is BaseButtonProps.WithIcon =>
  props.children != null && props.iconId != null

const isWithoutIcon = (
  props: Partial<CustomButtonProps>,
): props is BaseButtonProps.WithoutIcon =>
  props.children != null && props.iconId == null && props.iconPosition == null

export const Submit = ({
  isPending,
  ...props
}: { isPending: boolean } & ButtonProps) => {
  if (!(isIconOnly(props) || isWithIcon(props) || isWithoutIcon(props)))
    return 'Cannot display submit button'

  return (
    <Button type="submit" {...buttonLoadingClassname(isPending)} {...props}>
      {props.children}
    </Button>
  )
}
