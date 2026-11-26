import { failure, type Result, success } from '@/libraries/result'
import {
  ConsultationNonAutorisee,
  type CoordinateurId,
  type CriteresEquipe,
  type Lecteur,
  type LigneEquipe,
  peutConsulterLEquipe,
  profilDe,
  type UtilisateurId,
} from '../../../domain'
import {
  contratEnCours,
  type LigneContrat,
  type MembreAExporter,
} from './contrat-membre'
import type { EchecDExport } from './errors'
import type { ExporterLesMembresPorts } from './ports'

const utilisateursDe = (lignes: readonly LigneEquipe[]): UtilisateurId[] =>
  lignes.flatMap((ligne) => {
    const profil = profilDe(ligne)
    return profil === null ? [] : [profil.utilisateurId]
  })

const membreAExporter =
  (
    contrats: ReadonlyMap<UtilisateurId, readonly LigneContrat[]>,
    maintenant: Date,
  ) =>
  (ligne: LigneEquipe): MembreAExporter<LigneEquipe> => {
    const profil = profilDe(ligne)
    return {
      ligne,
      contrat:
        profil === null
          ? null
          : contratEnCours(
              contrats.get(profil.utilisateurId) ?? [],
              maintenant,
            ),
    }
  }

export const exporterLesMembres =
  ({
    lireLesMembresAExporter,
    lireLesContratsDesMembres,
  }: ExporterLesMembresPorts) =>
  async ({
    coordinateurId,
    lecteur,
    criteres,
    maintenant,
  }: {
    readonly coordinateurId: CoordinateurId
    readonly lecteur: Lecteur
    readonly criteres: CriteresEquipe
    readonly maintenant: Date
  }): Promise<
    Result<readonly MembreAExporter<LigneEquipe>[], EchecDExport>
  > => {
    if (!peutConsulterLEquipe(lecteur)(coordinateurId))
      return failure(ConsultationNonAutorisee())

    const lignes = await lireLesMembresAExporter({
      coordinateurId,
      criteres,
      maintenant,
    })

    const contrats = await lireLesContratsDesMembres(utilisateursDe(lignes))

    return success(lignes.map(membreAExporter(contrats, maintenant)))
  }
