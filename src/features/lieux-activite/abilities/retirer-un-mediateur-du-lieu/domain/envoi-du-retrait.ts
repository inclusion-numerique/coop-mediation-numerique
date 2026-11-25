export type EnvoyerLeRetraitDuLieu = (retrait: {
  readonly mediateurEmail: string
  readonly mediateurFirstname: string | null
  readonly structureNom: string
  readonly removedByName: string
}) => Promise<void>
