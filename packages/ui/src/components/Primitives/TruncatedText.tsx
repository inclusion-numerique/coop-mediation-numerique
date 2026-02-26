export const TruncateText = ({
  text,
  maxLength,
  className,
}: {
  text: string
  maxLength: number
  className?: string
}) => {
  if (!text) return null
  return (
    <span className={className}>
      {text.length > maxLength ? `${text.slice(0, maxLength)}...` : text}
    </span>
  )
}
