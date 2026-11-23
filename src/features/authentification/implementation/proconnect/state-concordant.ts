export const stateConcordant = ({
  recu,
  attendu,
}: {
  readonly recu: string | undefined
  readonly attendu: string | undefined
}): boolean => recu !== undefined && attendu !== undefined && recu === attendu
