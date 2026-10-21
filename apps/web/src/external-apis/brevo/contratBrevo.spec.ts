import { attributsContratBrevo } from './contratBrevo'

const contrat = ({
  debut = null,
  fin = null,
  rupture = null,
}: {
  debut?: string | null
  fin?: string | null
  rupture?: string | null
}) => ({
  dateDebut: debut ? new Date(debut) : null,
  dateFin: fin ? new Date(fin) : null,
  dateRupture: rupture ? new Date(rupture) : null,
})

describe('attributsContratBrevo', () => {
  it("n'envoie aucun attribut sans personne", () => {
    expect(attributsContratBrevo(null)).toEqual({})
  })

  it("n'envoie aucun attribut sans contrat, pour ne pas effacer l'import manuel", () => {
    expect(attributsContratBrevo({ contrats: [] })).toEqual({})
  })

  it('envoie la date de fin d’un CDD, sans rupture', () => {
    expect(
      attributsContratBrevo({
        contrats: [contrat({ debut: '2025-01-01', fin: '2026-12-15' })],
      }),
    ).toEqual({
      COOP_DATE_FIN_CONTRAT: '2026-12-15',
      COOP_DATE_RUPTURE: '',
    })
  })

  it('envoie des chaînes vides pour un CDI, afin d’effacer une valeur périmée', () => {
    expect(
      attributsContratBrevo({ contrats: [contrat({ debut: '2025-01-01' })] }),
    ).toEqual({
      COOP_DATE_FIN_CONTRAT: '',
      COOP_DATE_RUPTURE: '',
    })
  })

  it('envoie la fin et la rupture séparément', () => {
    expect(
      attributsContratBrevo({
        contrats: [
          contrat({
            debut: '2025-01-01',
            fin: '2026-12-15',
            rupture: '2026-07-10',
          }),
        ],
      }),
    ).toEqual({
      COOP_DATE_FIN_CONTRAT: '2026-12-15',
      COOP_DATE_RUPTURE: '2026-07-10',
    })
  })

  it('retient le contrat le plus récent par date de début', () => {
    expect(
      attributsContratBrevo({
        contrats: [
          contrat({ debut: '2023-01-01', fin: '2024-12-31' }),
          contrat({ debut: '2025-01-01', fin: '2026-12-15' }),
          contrat({ fin: '2022-06-30' }),
        ],
      }),
    ).toEqual({
      COOP_DATE_FIN_CONTRAT: '2026-12-15',
      COOP_DATE_RUPTURE: '',
    })
  })

  it("efface la rupture d'un poste précédent après une réembauche en CDI ailleurs", () => {
    expect(
      attributsContratBrevo({
        contrats: [
          // Ligne « rupture seule » telle que l'Entrepôt la porte : sans début ni fin.
          contrat({ rupture: '2024-01-02' }),
          contrat({ debut: '2024-01-03' }),
        ],
      }),
    ).toEqual({
      COOP_DATE_FIN_CONTRAT: '',
      COOP_DATE_RUPTURE: '',
    })
  })
})
