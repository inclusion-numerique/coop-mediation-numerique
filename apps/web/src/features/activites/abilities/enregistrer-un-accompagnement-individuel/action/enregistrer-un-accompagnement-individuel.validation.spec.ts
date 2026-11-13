import { EnregistrerUnAccompagnementIndividuelValidation } from './enregistrer-un-accompagnement-individuel.validation'

const saisie = {
  date: '2026-11-03',
  duree: 30,
  typeLieu: 'ADistance',
  thematiques: ['Email'],
  beneficiaire: null,
}

const erreurs = (entree: Record<string, unknown>) => {
  const resultat =
    EnregistrerUnAccompagnementIndividuelValidation.safeParse(entree)
  return resultat.success
    ? []
    : resultat.error.issues.map(({ path, message }) => ({
        champ: path.join('.'),
        message,
      }))
}

describe('validation d’un accompagnement individuel', () => {
  it('accompagne une personne anonyme par défaut', () => {
    const resultat =
      EnregistrerUnAccompagnementIndividuelValidation.parse(saisie)
    expect(resultat.beneficiaire).toMatchObject({
      id: null,
      dejaAccompagne: false,
      profil: { genre: 'NonCommunique', residence: null },
    })
    expect(resultat.orientation).toEqual({ _tag: 'NonRenseignee' })
  })

  it('range les thématiques administratives sous l’aide aux démarches', () => {
    const resultat = EnregistrerUnAccompagnementIndividuelValidation.parse({
      ...saisie,
      thematiques: ['Email', 'AideAuxDemarchesAdministratives', 'Logement'],
      precisionsDemarche: 'Demande d’APL',
    })
    expect(resultat.thematiques).toEqual({
      mediation: ['Email'],
      demarche: { thematiques: ['Logement'], precision: 'Demande d’APL' },
    })
  })

  it.each([
    [
      'une thématique administrative sans aide aux démarches',
      { thematiques: ['Logement'] },
      'thematiques',
    ],
    ['aucune thématique', { thematiques: [] }, 'thematiques'],
    ['un lieu d’activité absent', { typeLieu: 'LieuActivite' }, 'structure'],
    ['une commune absente', { typeLieu: 'Domicile' }, 'lieuCommuneData'],
    [
      '« pas de matériel » avec un matériel',
      { materiel: ['Aucun', 'Tablette'] },
      'materiel',
    ],
  ])('signale %s', (_, modification, champ) => {
    expect(erreurs({ ...saisie, ...modification }).map((e) => e.champ)).toEqual(
      [champ],
    )
  })
})
