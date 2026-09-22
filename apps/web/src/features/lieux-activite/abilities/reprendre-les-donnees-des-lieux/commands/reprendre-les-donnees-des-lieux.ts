import type {
  DeposerLeReleve,
  Journal,
  LieuAuxListesATrier,
  LireLesLieux,
  Releve,
  TrierLesListes,
} from '../domain'
import { relever } from '../domain'

const PAS_DU_JOURNAL = 500

export type PortsDeReprise = {
  readonly lireLesLieux: LireLesLieux
  readonly trierLesListes: TrierLesListes
  readonly deposerLeReleve: DeposerLeReleve
  readonly journal: Journal
}

export type Reprise = {
  readonly releve: Releve
  readonly lieuxTries: number
  readonly fichiers: readonly string[]
}

const avancement =
  (journal: Journal, total: number) =>
  (rang: number): void => {
    if (rang > 0 && rang % PAS_DU_JOURNAL === 0)
      journal(`${rang}/${total} lieux triés`)
  }

const trierChaqueLieu = async (
  { trierLesListes, journal }: PortsDeReprise,
  aTrier: readonly LieuAuxListesATrier[],
): Promise<number> => {
  const signaler = avancement(journal, aTrier.length)

  return aTrier.reduce<Promise<number>>(
    async (tries, { lieuId, colonnes }, rang) => {
      const acquis = await tries

      signaler(rang)
      await trierLesListes(lieuId, colonnes)

      return acquis + 1
    },
    Promise.resolve(0),
  )
}

export const reprendreLesDonneesDesLieux = async ({
  ports,
}: {
  readonly ports: PortsDeReprise
}): Promise<Reprise> => {
  const releve = relever(await ports.lireLesLieux())

  return {
    releve,
    lieuxTries: await trierChaqueLieu(ports, releve.listesATrier.lieux),
    fichiers: await ports.deposerLeReleve(releve),
  }
}
