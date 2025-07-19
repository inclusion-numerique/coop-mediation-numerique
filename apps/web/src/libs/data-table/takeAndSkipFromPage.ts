export const takeAndSkipFromPage = ({
  pageSize,
  page: pageParameter,
}: {
  page?: number | null
  pageSize?: number | null
}) => {
  const page = pageParameter && pageParameter > 0 ? pageParameter : 1

  return {
    take: pageSize ?? 0,
    skip: (page - 1) * (pageSize ?? 0),
  }
}
