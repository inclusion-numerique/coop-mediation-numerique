export const TruncateText = ({
  text,
  maxLength,
}: {
  text: string
  maxLength: number
}) => {
  if (!text) return null
  return (
    <span>
      {text.length > maxLength ? `${text.slice(0, maxLength)}...` : text}
    </span>
  )
}
