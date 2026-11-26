import {
  EtapeDInscription,
  etapeSuivante,
  type InscriptionContexte,
  ProfilInscription,
  profilInscriptionLabels,
  TypeDeParcours,
} from '@/features/inscription/domain'
import type { ProfilInscriptionValue } from '@/features/inscription/domain/profil-inscription'
import { cheminDeLEtape } from '@/features/inscription/ui/presenters/chemin-de-l-etape.presenter'

type StructureDeLEmploi = {
  readonly nom: string | null
  readonly codeInsee: string | null
}

type StructureEmployeuseAffichee = Omit<StructureDeLEmploi, 'nom'> & {
  readonly nom: string
}

type InscritAVerifier = {
  readonly profilInscription: ProfilInscriptionValue | null
  readonly isConseillerNumerique: boolean
  readonly name: string | null
  readonly email: string
  readonly emplois: readonly { readonly structure: StructureDeLEmploi }[]
}

export type VerifierInformationsPageData = {
  readonly profilLabel: string
  readonly name: string | null
  readonly email: string
  readonly structureEmployeuse?: StructureEmployeuseAffichee
  readonly backHref: string
  readonly nextStepPath: string
}

export const donneesDeVerifierInformations = (
  user: InscritAVerifier,
): VerifierInformationsPageData => {
  const contexte: InscriptionContexte = {
    flowType: TypeDeParcours('withoutDataspace'),
    profil: user.profilInscription
      ? ProfilInscription(user.profilInscription)
      : null,
    hasLieuxActivite: false,
    isConseillerNumerique: user.isConseillerNumerique,
  }

  const nextStep = etapeSuivante(
    EtapeDInscription('verifier-informations'),
    contexte,
  )

  if (!nextStep) {
    throw new Error('No next step found for inscription')
  }

  const nextStepPath =
    nextStep === 'lieux-activite'
      ? user.emplois.length > 0
        ? `${cheminDeLEtape('lieux-activite')}/structure-employeuse`
        : cheminDeLEtape('renseigner-structure-employeuse')
      : cheminDeLEtape(nextStep)

  const employeuse = user.emplois.at(0)?.structure

  return {
    profilLabel: user.profilInscription
      ? profilInscriptionLabels[user.profilInscription]
      : 'Non renseigné',
    name: user.name,
    email: user.email,
    ...(employeuse
      ? { structureEmployeuse: { ...employeuse, nom: employeuse.nom ?? '' } }
      : {}),
    backHref: cheminDeLEtape('choisir-role'),
    nextStepPath,
  }
}
