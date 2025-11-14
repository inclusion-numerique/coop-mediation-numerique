export const CustomLabel = ({
  value,
  customizableValue,
  customValue,
}: {
  value?: string
  customizableValue: string
  customValue: string | null
}) => (customValue && value === customizableValue ? customValue : value)
