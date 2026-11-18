# ADR-NNN : Titre court qui énonce la décision

Ce fichier est le modèle des ADR du dépôt. Les personnes comme les agents le suivent pour en
rédiger un : copier ce fichier en `adr-NNN-titre-en-kebab-case.md`, avec le numéro suivant le
dernier ADR, puis remplacer chaque consigne par le contenu.

## Règles de rédaction

- **Living documentation** : l'ADR pose les décisions et leurs raisons, de façon générique. Le
  détail qui peut dériver vit dans les abilities (`*.ability.md`), spécifications exécutables qui
  font foi ; l'ADR y renvoie. Aucun nom de fonction, de fichier ou de ligne de code, aucun chemin
  dans le texte : seuls les liens de « Où trouver le détail » et de « Références » pointent vers
  le dépôt.
- **Pas de journal** : aucune mise à jour datée dans le corps. L'historique git porte le détail ;
  le tableau d'historique ne garde que les rédactions et les révisions de l'ADR.
- **Renvois vers le passé seulement** : un ADR ne référence que des ADR de numéro inférieur, jamais
  un ADR postérieur. Il pose une situation à un instant donné ; c'est le nouvel ADR qui cite
  l'ancien qu'il complète ou remplace.
- **Vocabulaire** : « Dataspace » désigne la plateforme, « main » désigne uniquement le schéma de
  base de données.
- **Pas d'état transitoire** : ne pas décrire les étapes intermédiaires d'une migration. Une
  décision dont la cible n'est pas atteinte décrit l'état actuel puis s'écrit « Cible à atteindre,
  ticket à ouvrir ».
- **Pas de chiffres qui dérivent** : pas de compte de fichiers, de lignes ou d'occurrences, sauf
  les chiffres qui ont fondé la décision.
- **Pas de point médian** : reformuler en tournure neutre (« les personnes concernées »).

## Auteurs et historique

| Date       | Auteur     | Action                      |
| ---------- | ---------- | --------------------------- |
| AAAA-MM-JJ | Prénom Nom | Rédaction initiale de l'ADR |

Une ligne par rédaction ou révision de l'ADR, pas par évolution du code. L'action dit en quelques
mots ce que la révision change dans la décision ou dans sa rédaction.

## Statut

Proposé, Accepté, Remplacé par l'ADR-NNN, ou Abandonné. Une précision courte peut suivre sur le
périmètre où la décision s'applique, sans détailler l'avancement d'une migration.

## Contexte

Le problème à résoudre et les contraintes qui pèsent sur lui, tels qu'ils se présentaient au
moment de la décision. Citer les ADR antérieurs dont la décision dépend. Garder les seuls chiffres
qui ont pesé sur le choix.

## Décision

Ouvrir par une ou deux phrases qui énoncent la décision dans son ensemble, puis une sous-section
par règle.

### Première règle de la décision

Énoncer la règle et sa raison en termes métier ou d'architecture, sans nommer de code. Quand la
cible n'est pas atteinte : décrire l'état actuel, puis « Cible à atteindre, ticket à ouvrir ».

### Deuxième règle de la décision

Une sous-section par règle indépendante, avec un titre qui énonce la règle elle-même.

## Alternatives écartées

### Nom de l'alternative

Ce qu'elle proposait et pourquoi elle a été écartée, en quelques phrases. Une sous-section par
alternative réellement envisagée.

## Conséquences

Ce que la décision rend possible et ce qu'elle coûte, côté positif comme côté négatif. Les limites
connues et les cibles non atteintes y figurent, sans calendrier.

## Où trouver le détail

Les liens vers les abilities qui décrivent chaque comportement : ce sont elles qui font foi, et
les tests les jouent. Renvoyer au dossier des abilities d'une feature plutôt qu'à son code.

## Références

Documentation externe (API, normes, RFC), ADR antérieurs, conventions du dépôt. Un lien par ligne,
suivi d'une courte description si le titre ne suffit pas.
