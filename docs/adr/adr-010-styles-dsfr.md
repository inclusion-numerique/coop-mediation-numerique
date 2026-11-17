# ADR-010 : Styles : utilitaires du DSFR et intégration officielle de react-dsfr

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                                     |
| ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-06-24 | Marc Gavanier | Premier `*.module.css` supprimé au profit des utilitaires : celui de la bibliothèque `data-table` (`330f79ec4`)                            |
| 2026-06-25 | Marc Gavanier | `BeneficiaireFusionDoublons.module.css` remplacé par des utilitaires DSFR au lieu d'être déplacé tel quel (`13bfd370b`)                    |
| 2026-06-26 | Marc Gavanier | Règle UI-2 dans les conventions : pas de `*.module.css` (`9e7dbc659`)                                                                      |
| 2026-11-17 | Marc Gavanier | Intégration du DSFR selon l'installation officielle de react-dsfr ; suppression de `setup-dsfr.sh` et de `public/dsfr` (`655406209`, #735) |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                                  |

## Statut

Accepté — en place. Plus aucun `*.module.css` dans `features/` ; il en reste hors des features
(voir Conséquences).

## Contexte

### Des styles éparpillés

Les composants portaient leurs propres `*.module.css`, à côté du `.tsx`. Certaines de ces
règles recopiaient ce que le DSFR fournit déjà en classes utilitaires, comme un `font-size: 0`
pour masquer un libellé que `fr-sr-only` masque. D'autres fixaient une largeur en pixels qui n'était que la somme
d'un contenu et de son padding. Déplacer un composant déplaçait son module CSS, sans que personne
ne se demande s'il servait encore.

### Une intégration du DSFR faite main

Le DSFR n'était pas intégré selon la documentation de react-dsfr. Un script, `setup-dsfr.sh`,
copiait le paquet `@gouvfr/dsfr` dans `public/dsfr`. Le script du DSFR était chargé à la main, les
icônes remixicon venaient d'un CDN, les polices étaient préchargées par un code maison, et le
thème clair ou sombre passait par un cookie et un bouton propres à l'application.

## Décision

### Volet 1 : pas de `*.module.css`

On ne crée pas de `*.module.css`, et on ne déplace pas un module existant tel quel : on le
convertit. Par ordre de préférence :

1. une classe utilitaire du DSFR (`fr-mb-8v`, `fr-sr-only`…) ;
2. un helper global de `apps/web/src/styles/helpers/*.css`, nommé selon la nomenclature du DSFR
   (`fr-flex`, `fr-cell--*`…) ;
3. pour ce qui ne se décrit pas avec les jetons du DSFR (ajustement au pixel, surcharge d'un
   composant), une feuille de `apps/web/src/styles/components/*.css`. Les surcharges de composants
   DSFR vont dans `styles/components/overrides/`.

Avant d'écrire une règle, on vérifie qu'elle n'est pas redondante, et on lit le composant
react-dsfr et `dsfr.css` plutôt que de supposer la structure du DOM.

### Volet 2 : l'installation officielle de react-dsfr

Le 17/11/2026, le DSFR est intégré comme le décrit l'onglet « Next.js App Router » de la
documentation de react-dsfr (https://react-dsfr.codegouv.studio/) :

- le bootstrap du dépôt de démonstration vit dans `apps/web/src/configuration/dsfr` :
  `DsfrProvider`, `DsfrHead`, `getHtmlAttributes`, `StartDsfrOnHydration`, et le schéma de
  couleur `system` ;
- `react-dsfr optimize-css` tourne en `predev` et en `prebuild` ;
- `StartDsfrOnHydration` est monté sur chaque page par `app/template.tsx` ;
- le thème suit les « Paramètres d'affichage » du DSFR, au lieu du cookie et du bouton maison ;
- les classes utilitaires de couleur (`fr-text-title--*`, `fr-background-alt--*`…) sont importées
  depuis `@codegouvfr/react-dsfr/dsfr/utility/colors/colors.min.css`. Ni `dsfr.min.css` ni le
  `main.css` de react-dsfr ne les contiennent. Seule la partie couleurs est importée : le reste de
  `utility.min.css`, ce sont les icônes, que react-dsfr fournit déjà et élague.

### `DsfrHead` en tête de `<body>`

`DsfrHead` est rendu en tête de `<body>`, pas dans `<head>`. Avec le schéma `system`, il émet un
script inline. Dans `<head>`, React apparie ce script au premier script inline qu'il y trouve. Or
Cypress, comme certaines extensions de navigateur, en injecte un en tête de `<head>`.
L'hydratation échouait alors, React reconstruisait `<html>` et en effaçait les attributs
`data-fr-js`, `data-fr-scheme` et `data-fr-theme`. En tête de `<body>`, aucun script injecté ne le
précède, et il s'exécute toujours avant le reste de la page. React 19 hisse de lui-même ses
`<link>` de préchargement dans `<head>`.

### Ce qui disparaît

`setup-dsfr.sh`, `public/dsfr`, la dépendance directe à `@gouvfr/dsfr`, le CDN remixicon
(react-dsfr fournit les icônes `ri-`), le chargement manuel du script DSFR, le préchargement
maison des polices, le cookie et le bouton de thème.

### Détail normatif

`.claude/conventions/feature-architecture.md` : UI-2 (pas de `*.module.css`). `AGENTS.md`,
section « CSS Classes ».

## Alternatives écartées

### Déplacer les modules CSS avec leurs composants

Chaque déplacement aurait conservé du CSS dont une partie doublait le DSFR. Le déplacement est le
moment où quelqu'un relit ces règles : c'est là qu'on les convertit.

### Garder l'intégration faite main du DSFR

Elle obligeait à maintenir un script de copie, une version du DSFR découplée de celle de
react-dsfr, et un mécanisme de thème propre. L'installation documentée par react-dsfr couvre ces
besoins et élague le CSS inutilisé.

## Conséquences

Positives :

- Un composant de feature n'a plus de CSS à lui : son apparence se lit dans ses classes.
- La version du DSFR est celle que livre react-dsfr. Plus de copie dans `public/`.
- `optimize-css` ne garde que les icônes réellement utilisées.
- Le thème sombre suit le réglage du système, par le mécanisme du DSFR.

Négatives :

- Au 17/11/2026, 32 `*.module.css` restent hors des features : 16 dans `apps/web/src` (`app/`,
  `components/`, `libs/`, `ui/`) et 16 dans `packages/ui`.
- Les helpers de `styles/helpers` imitent la nomenclature du DSFR : une classe `fr-*` n'est donc
  pas forcément du DSFR. Il faut chercher dans les deux.
- Les classes de taille de la police remixicon (`ri-xl`, `ri-lg`, `ri-md`, `ri-2x`) n'existent
  plus. Les icônes ont pris la taille par défaut du DSFR ou `fr-icon--lg`, et l'icône
  `ri-user-community-line`, absente de react-dsfr, est devenue `ri-team-line`.
- Le DSFR n'a pas de variantes `success`, `new` ni `error` pour la notice : la surcharge
  `styles/components/overrides/notice.css` reste nécessaire.
- Aucun outil ne vérifie une mise en page : ni `tsc`, ni biome, ni les tests. Une correction CSS
  se vérifie à l'œil.

## Références

- `apps/web/src/configuration/dsfr/`
- `apps/web/src/app/layout.tsx`, `apps/web/src/app/template.tsx`, `apps/web/src/app/setup.ts`
- `apps/web/src/styles/`
- https://react-dsfr.codegouv.studio/

## ADR liés

- [ADR-017 : Chaîne d'approvisionnement des dépendances](./adr-017-chaine-d-approvisionnement.md)
