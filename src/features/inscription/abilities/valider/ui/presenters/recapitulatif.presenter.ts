import { cheminDeLEtape } from '@/features/inscription/ui/presenters/chemin-de-l-etape.presenter'
import type { EmployeuseAffichee } from '@/features/inscription/ui/presenters/employeuse-affichee.presenter'
import type {
  InscritDuRecapitulatif,
  RecapitulatifLu,
} from '../../domain/recapitulatif'

export const recapitulatifPresente = <Lieu>({
  user,
  employeuse,
  lu: { lieuxActivite, mediateursCoordonnesCount, importedLieuxFromDataspace },
}: {
  user: InscritDuRecapitulatif
  employeuse: EmployeuseAffichee | null
  lu: RecapitulatifLu<Lieu>
}) => ({
  user,
  structureEmployeuse: employeuse ?? undefined,
  lieuxActivite,
  mediateursCoordonnesCount,
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
    (user.profilInscription === 'ConseillerNumerique' &&
      !importedLieuxFromDataspace)
      ? 3
      : null,
})

export type RecapitulatifPageData = Omit<
  ReturnType<typeof recapitulatifPresente>,
  'lieuxActivite'
>
