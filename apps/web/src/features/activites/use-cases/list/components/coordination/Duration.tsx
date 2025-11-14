interface DurationProps {
  duration: number
}

export const Duration = ({ duration }: DurationProps) => {
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  return (
    <>
      {hours > 0 && `${hours}h`}
      {hours > 0 && minutes > 0 && minutes}
      {hours === 0 && `${minutes}min`}
    </>
  )
}
