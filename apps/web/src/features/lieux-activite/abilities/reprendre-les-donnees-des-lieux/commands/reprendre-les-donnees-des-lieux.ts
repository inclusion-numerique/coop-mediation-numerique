import type {
  DeposerLeReleve,
  HorairesAReprendre,
  Journal,
  LieuAuReleve,
  LireLesLieux,
  Releve,
  ReprendreLesHoraires,
  TrierLesListes,
} from '../domain'
import { relever } from '../domain'

const PAS_DU_JOURNAL = 500

export type PortsDeReprise = {
  readonly lireLesLieux: LireLesLieux
  readonly trierLesListes: TrierLesListes
  readonly reprendreLesHoraires: ReprendreLesHoraires
  readonly deposerLeReleve: DeposerLeReleve
  readonly journal: Journal
}

export type Reprise = {
  readonly releve: Releve
  readonly lieuxRepris: number
  readonly fichiers: readonly string[]
}

const horairesAEcrire = (horaires: HorairesAReprendre): string | null =>
  horaires.verdict === 'a-corriger' ? horaires.corriges : null

const reprendreLeLieu = async (
  { trierLesListes, reprendreLesHoraires }: PortsDeReprise,
  { lieuId, listesATrier, horaires }: LieuAuReleve,
): Promise<void> => {
  if (listesATrier.length > 0) await trierLesListes(lieuId, listesATrier)
  if (horaires != null)
    await reprendreLesHoraires(lieuId, horairesAEcrire(horaires))
}

const avancement =
  (journal: Journal, total: number) =>
  (rang: number): void => {
    if (rang > 0 && rang % PAS_DU_JOURNAL === 0)
      journal(`${rang}/${total} lieux parcourus`)
  }

const reprendreChaqueLieu = async (
  ports: PortsDeReprise,
  lieux: readonly LieuAuReleve[],
): Promise<number> => {
  const signaler = avancement(ports.journal, lieux.length)

  return lieux.reduce<Promise<number>>(async (repris, lieu, rang) => {
    const acquis = await repris

    signaler(rang)
    await reprendreLeLieu(ports, lieu)

    return acquis + 1
  }, Promise.resolve(0))
}

export const reprendreLesDonneesDesLieux = async ({
  ports,
}: {
  readonly ports: PortsDeReprise
}): Promise<Reprise> => {
  const releve = relever(await ports.lireLesLieux())

  return {
    releve,
    lieuxRepris: await reprendreChaqueLieu(ports, releve.lieux),
    fichiers: await ports.deposerLeReleve(releve),
  }
}
