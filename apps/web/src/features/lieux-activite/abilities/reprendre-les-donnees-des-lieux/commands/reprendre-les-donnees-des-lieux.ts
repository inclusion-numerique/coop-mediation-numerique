import type {
  DeposerLeReleve,
  Journal,
  LieuAuReleve,
  LireLesLieux,
  Releve,
  Reprise,
} from '../domain'
import { relever } from '../domain'

const PAS_DU_JOURNAL = 500

export type PortsDeReprise = {
  readonly lireLesLieux: LireLesLieux
  readonly deposerLeReleve: DeposerLeReleve
  readonly journal: Journal
}

export type Passe = {
  readonly releve: Releve
  readonly lieuxRepris: number
  readonly fichiers: readonly string[]
}

const reprendreLeLieu = async ({ constats }: LieuAuReleve): Promise<void> => {
  await constats.reduce(async (fait, constat) => {
    await fait

    return constat.appliquer()
  }, Promise.resolve())
}

const avancement =
  (journal: Journal, total: number) =>
  (rang: number): void => {
    if (rang > 0 && rang % PAS_DU_JOURNAL === 0)
      journal(`${rang}/${total} lieux parcourus`)
  }

const reprendreChaqueLieu = async (
  journal: Journal,
  lieux: readonly LieuAuReleve[],
): Promise<number> => {
  const signaler = avancement(journal, lieux.length)

  return lieux.reduce<Promise<number>>(async (repris, lieu, rang) => {
    const acquis = await repris

    signaler(rang)
    await reprendreLeLieu(lieu)

    return acquis + 1
  }, Promise.resolve(0))
}

export const reprendreLesDonneesDesLieux = async ({
  reprises,
  ports,
}: {
  readonly reprises: readonly Reprise[]
  readonly ports: PortsDeReprise
}): Promise<Passe> => {
  const releve = relever(reprises, await ports.lireLesLieux())

  return {
    releve,
    lieuxRepris: await reprendreChaqueLieu(ports.journal, releve.lieux),
    fichiers: await ports.deposerLeReleve(releve),
  }
}
