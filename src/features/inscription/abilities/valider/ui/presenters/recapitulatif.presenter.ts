import type { ProfilInscriptionValue } from '@/features/inscription/domain/profil-inscription'
import { cheminDeLEtape } from '@/features/inscription/ui/presenters/chemin-de-l-etape.presenter'
import type { EmployeuseAffichee } from '@/features/inscription/ui/presenters/employeuse-affichee.presenter'

type InscritDuRecapitulatif = {
  readonly id: string
  readonly email: string
  readonly name: string | null
  readonly profilInscription: ProfilInscriptionValue | null
  readonly acceptationCgu: Date | null
  readonly isConseillerNumerique: boolean
  readonly mediateur: { readonly id: string } | null
  readonly coordinateur: { readonly id: string } | null
}

type RecapitulatifConsulte<Lieu> = {
  readonly lieuxActivite: readonly Lieu[]
  readonly nombreDeMediateursCoordonnes: number | null
  readonly lieuxImportesLe: Date | null
}

export const recapitulatifPresente = <Lieu>({
  user,
  employeuse,
  recapitulatif: {
    lieuxActivite,
    nombreDeMediateursCoordonnes,
    lieuxImportesLe,
  },
}: {
  user: InscritDuRecapitulatif
  employeuse: EmployeuseAffichee | null
  recapitulatif: RecapitulatifConsulte<Lieu>
}) => ({
  user,
  structureEmployeuse: employeuse ?? undefined,
  lieuxActivite,
  mediateursCoordonnesCount: nombreDeMediateursCoordonnes,
  backHref: user.mediateur
    ? cheminDeLEtape('lieux-activite')
    : user.profilInscription === 'Coordinateur'
      ? cheminDeLEtape('choisir-role')
      : null,
  mustAcceptCgu: !user.acceptationCgu,
  canCancelInscription:
    user.profilInscription !== 'CoordinateurConseillerNumerique',
  conseillerNumeriqueRole:
    user.profilInscription === 'ConseillerNumerique'
      ? ('ConseillerNumerique' as const)
      : user.profilInscription === 'CoordinateurConseillerNumerique'
        ? ('CoordinateurConseillerNumerique' as const)
        : undefined,
  showConseillerNumeriqueSupportLink:
    user.profilInscription === 'CoordinateurConseillerNumerique',
  showInscriptionSteps:
    user.profilInscription === 'Mediateur' ||
    (user.profilInscription === 'ConseillerNumerique' && !lieuxImportesLe)
      ? 3
      : null,
})

export type RecapitulatifPageData = Omit<
  ReturnType<typeof recapitulatifPresente>,
  'lieuxActivite'
>
