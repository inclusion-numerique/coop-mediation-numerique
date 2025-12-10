import type { ProfilInscription } from '@prisma/client'

export type InscriptionInitializeResult = {
  hasDataspaceData: boolean
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    siret: string | null
    profilInscription: ProfilInscription | null
    lieuxActiviteRenseignes: Date | null
    mediateur: {
      id: string
      _count: {
        enActivite: number
      }
    } | null
    coordinateur: {
      id: string
      mediateursCoordonnes: { mediateurId: string }[]
    } | null
  } | null
  fallbackStructure: {
    id?: string
    nom: string
    siret?: string | null
    adresse?: string
    commune?: string
    codePostal?: string
  } | null
}


