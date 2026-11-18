---
status: "accepté"
date: 2026-11-17
decision-makers: Marc Gavanier
---

# Styles : utilitaires du DSFR et intégration officielle de react-dsfr

## Contexte et problème

### Des styles éparpillés

Chaque composant avait son fichier CSS à côté de lui. Certaines de ces règles recopiaient ce que
le DSFR fournit déjà en classes utilitaires, d'autres fixaient des tailles en pixels qui ne
faisaient que reproduire un contenu et ses marges.

### Un CSS qui suivait son composant sans être relu

Déplacer un composant déplaçait son fichier CSS, sans que personne ne vérifie si ses règles
servaient encore.

### Une intégration du DSFR faite à la main

Le DSFR n'était pas intégré selon la documentation de react-dsfr. Un script copiait le paquet du
DSFR dans les fichiers publics de l'application, le script du DSFR était chargé à la main, les
icônes venaient d'un CDN, les polices étaient préchargées par du code maison, et le thème clair ou
sombre passait par un cookie et un bouton propres à l'application.

## Options envisagées

- Styles : utilitaires du DSFR et intégration officielle de react-dsfr (option retenue)
- Déplacer les fichiers CSS avec leurs composants
- Garder l'intégration faite à la main

## Décision

Option retenue : « Styles : utilitaires du DSFR et intégration officielle de react-dsfr ».

L'apparence d'un composant s'écrit avec les classes du DSFR plutôt qu'avec une feuille de style
qui lui est propre, et le DSFR est intégré exactement comme le documente react-dsfr.

### Pas de fichier CSS par composant

On ne crée pas de fichier CSS par composant, et on ne déplace pas un fichier existant tel quel : on
le convertit. Par ordre de préférence :

1. une classe utilitaire du DSFR ;
2. un helper global, nommé selon la nomenclature du DSFR ;
3. une feuille de composant, seulement pour ce qui ne se décrit pas avec les jetons du DSFR. Les
   surcharges de composants du DSFR vont dans un dossier dédié.

Avant d'écrire une règle, on vérifie qu'elle n'est pas redondante, et on lit le composant
react-dsfr plutôt que de supposer la structure du DOM.

### Le DSFR intégré selon la documentation officielle de react-dsfr

Le DSFR est intégré comme le décrit la documentation officielle de react-dsfr pour Next.js App
Router :

- l'optimisation du CSS tourne avant le développement et avant le build ;
- le démarrage du DSFR est monté sur chaque page ;
- le thème suit les paramètres d'affichage du DSFR, à la place du cookie et du bouton maison ;
- les utilitaires de couleur sont importés séparément, car ni le CSS du DSFR ni celui de
  react-dsfr ne les contiennent.

### L'en-tête du DSFR en tête du body

L'en-tête du DSFR est rendu en tête du body, et non dans le head. Son script inline y était
apparié par React à celui qu'injectent Cypress et certaines extensions de navigateur, ce qui
faisait échouer l'hydratation. En tête du body, aucun script injecté ne le précède, et il
s'exécute toujours avant le reste de la page.

### Ce qui disparaît

Le script de copie, le dossier public du DSFR, la dépendance directe au DSFR, le CDN d'icônes, le
chargement manuel du script, le préchargement maison des polices, le cookie et le bouton de thème.

### Conséquences

Positives :

- Un composant de feature n'a plus de CSS à lui : son apparence se lit dans ses classes.
- La version du DSFR est celle que livre react-dsfr, sans copie dans le dossier public.
- L'optimisation ne garde que les icônes réellement utilisées.
- Le thème sombre suit le réglage du système, par le mécanisme du DSFR.

Négatives :

- Des fichiers CSS par composant subsistent hors des features. Cible à atteindre, ticket à ouvrir.
- Les helpers imitent la nomenclature du DSFR : une classe qui commence par `fr` n'est donc pas
  forcément du DSFR. Il faut chercher dans les deux.
- Les anciennes classes de taille d'icônes n'existent plus : les icônes ont pris la taille par
  défaut du DSFR.
- Le DSFR n'a pas de variantes de notice pour le succès, la nouveauté ou l'erreur : une surcharge
  reste nécessaire.
- Aucun outil ne vérifie une mise en page : une correction CSS se vérifie à l'œil.

## Avantages et inconvénients des options

### Déplacer les fichiers CSS avec leurs composants

Chaque déplacement aurait gardé du CSS dont une partie doublait le DSFR. Le déplacement est le
moment où quelqu'un relit ces règles : c'est là qu'on les convertit.

### Garder l'intégration faite à la main

Elle obligeait à maintenir un script de copie, une version du DSFR découplée de celle de
react-dsfr, et un mécanisme de thème propre. L'installation documentée par react-dsfr couvre ces
besoins et élague le CSS inutilisé.

## Plus d'informations

### Où trouver le détail

Les règles normatives sur les styles sont dans les
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md) et
dans la section « CSS Classes » d'[`AGENTS.md`](../../AGENTS.md).

### Références

- [`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md) — règle sur les `*.module.css`
- [`AGENTS.md`](../../AGENTS.md) — section « CSS Classes »
- [react-dsfr](https://react-dsfr.codegouv.studio/) — documentation officielle, installation pour Next.js App Router

### Historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |
