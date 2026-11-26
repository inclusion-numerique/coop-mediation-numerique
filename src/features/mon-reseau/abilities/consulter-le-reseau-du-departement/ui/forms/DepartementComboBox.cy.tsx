import '@codegouvfr/react-dsfr/assets/dsfr_plus_icons.css'
import '@codegouvfr/react-dsfr/dsfr/utility/colors/colors.min.css'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import type { DepartementDuReferentiel } from '@/libraries/departement'
import CompteurDuReseau from '../components/CompteurDuReseau'
import DepartementComboBox from './DepartementComboBox'

type Couleur = readonly [number, number, number]

type Zone = {
  readonly left: number
  readonly top: number
  readonly width: number
  readonly height: number
}

const sansEffet = (): void => undefined

const routeurInerte: AppRouterInstance = {
  back: sansEffet,
  forward: sansEffet,
  refresh: sansEffet,
  push: sansEffet,
  replace: sansEffet,
  prefetch: sansEffet,
  bfcacheId: 'test',
}

const rhone: DepartementDuReferentiel = { code: '69', nom: 'Rhône' }

const monterAvecLeCompteurDessous = () =>
  cy.mount(
    <AppRouterContext.Provider value={routeurInerte}>
      <div style={{ width: '400px' }}>
        <DepartementComboBox defaultDepartement={rhone} />
        <CompteurDuReseau
          count={1234}
          label="Acteurs de l'inclusion numérique"
          iconId="fr-icon-account-line"
          href="/acteurs"
          linkLabel="Voir l’annuaire des acteurs"
        />
      </div>
    </AppRouterContext.Provider>,
  )

const couleurDe = (element?: Element): Couleur => {
  const [rouge = 0, vert = 0, bleu = 0] = (
    element?.ownerDocument.defaultView?.getComputedStyle(element).color ?? ''
  )
    .match(/\d+/g)
    ?.map(Number) ?? [0, 0, 0]
  return [rouge, vert, bleu]
}

const zoneDe = (element?: Element): Zone => {
  const { left, top, width, height } =
    element?.getBoundingClientRect() ?? new DOMRect()
  return { left, top, width, height }
}

const estProcheDe =
  (couleur: Couleur) =>
  (rouge: number, vert: number, bleu: number): boolean =>
    Math.abs(rouge - couleur[0]) <= 8 &&
    Math.abs(vert - couleur[1]) <= 8 &&
    Math.abs(bleu - couleur[2]) <= 8

const pixelsDeLaCouleur = (
  pixels: Uint8ClampedArray,
  couleur: Couleur,
): number =>
  Array.from({ length: pixels.length / 4 }, (_, rang) => rang * 4).filter(
    (debut) =>
      estProcheDe(couleur)(
        pixels[debut] ?? 0,
        pixels[debut + 1] ?? 0,
        pixels[debut + 2] ?? 0,
      ),
  ).length

const pixelsDeLaZone = async (
  captureEnBase64: string,
  zone: Zone,
  largeurDeLaFenetre: number,
): Promise<Uint8ClampedArray> => {
  const image = await createImageBitmap(
    await (await fetch(`data:image/png;base64,${captureEnBase64}`)).blob(),
  )
  const echelle = image.width / largeurDeLaFenetre
  const toile = new OffscreenCanvas(image.width, image.height)
  const contexte = toile.getContext('2d')
  contexte?.drawImage(image, 0, 0)
  return (
    contexte?.getImageData(
      Math.round(zone.left * echelle),
      Math.round(zone.top * echelle),
      Math.max(1, Math.round(zone.width * echelle)),
      Math.max(1, Math.round(zone.height * echelle)),
    ).data ?? new Uint8ClampedArray()
  )
}

const adresseDuMasque = (element?: Element): string =>
  /url\("?([^")]+)"?\)/.exec(
    element?.ownerDocument.defaultView?.getComputedStyle(element, '::before')
      .maskImage ?? '',
  )?.[1] ?? ''

const imageChargee = async (
  fenetre: Window & typeof globalThis,
  adresse: string,
): Promise<void> => {
  const image = new fenetre.Image()
  image.src = adresse
  await image.decode()
}

const prochaineImageAffichee = (fenetre: Window): Promise<void> =>
  new Promise((affichee) =>
    fenetre.requestAnimationFrame(() =>
      fenetre.requestAnimationFrame(() => affichee()),
    ),
  )

const pixelsDeLIconeVisiblesALEcran = () =>
  cy.get('.icone-dans-un-carre__icone').then(($icone) =>
    cy.window().then((fenetre) => {
      const capture = Promise.withResolvers<string>()
      return cy
        .wrap(
          imageChargee(fenetre, adresseDuMasque($icone[0])).then(() =>
            prochaineImageAffichee(fenetre),
          ),
        )
        .screenshot('liste-des-departements', {
          capture: 'viewport',
          overwrite: true,
          onAfterScreenshot: (_, { path }) => capture.resolve(path),
        })
        .then(() => capture.promise)
        .then((chemin) => cy.readFile(chemin, 'base64'))
        .then((image: string) =>
          pixelsDeLaZone(image, zoneDe($icone[0]), fenetre.innerWidth),
        )
        .then((pixels) => pixelsDeLaCouleur(pixels, couleurDe($icone[0])))
    }),
  )

describe('Liste des départements de Mon réseau', () => {
  it('cache l’icône du compteur qui la suit', () => {
    cy.viewport(500, 600)
    monterAvecLeCompteurDessous()
    cy.get('button[aria-label="Afficher la liste des départements"]').click()
    cy.contains('[role="option"]', 'Ain · 01')
    pixelsDeLIconeVisiblesALEcran().should('equal', 0)
  })

  it('montre l’icône du compteur tant que la liste est fermée', () => {
    cy.viewport(500, 600)
    monterAvecLeCompteurDessous()
    pixelsDeLIconeVisiblesALEcran().should('be.greaterThan', 0)
  })
})
