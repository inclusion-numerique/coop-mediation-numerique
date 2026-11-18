# ADR-007 : `app/` ne contient que le routage Next

## Auteurs et historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |

## Statut

Accepté

## Contexte

Avant la refacto, le dossier `app/` portait bien plus que le routage. Une route pouvait réunir à
la fois le contrôle d'accès, une requête en base, la mise en forme des données et tout le rendu de
la page.

Plusieurs problèmes en découlaient :

- le code métier dépendait du framework par sa seule adresse : tout fichier de ce dossier suit les
  conventions de Next, si bien qu'un changement de version de Next touche du code étranger au
  routage ;
- un même écran vivait à deux endroits, une partie dans le dossier de routage, une autre dans une
  feature ;
- une route qui définit sa server action en ligne crée un point d'entrée sans schéma de
  validation.

Le découpage du code en features et en abilities, posé par
l'[ADR-004](./0004-architecture-par-features-et-abilities.md), donne une place au code métier ;
cet ADR décide de ce qui reste dans le dossier de routage.

## Décision

Le dossier `app/` ne garde que ce qui est couplé à Next. Une route s'y limite à contrôler l'accès,
préparer ses entrées, récupérer ses données par une ability et rendre un composant de la feature ;
tout le reste vit dans les features.

### Un fichier ne reste dans `app/` que s'il a une spécificité Next

La question n'est pas « est-ce un composant ? », mais « ce fichier est-il couplé au framework ? ».
Restent dans `app/` :

- les pages et les layouts ;
- les routes minces, qui délèguent à la feature ;
- les server actions, dans leur dossier dédié ;
- les fichiers spéciaux de Next.

Tout le reste va dans une feature : composants, presenters, chargeurs de données. L'accès à la
base et l'agrégation de données ne sont pas du framework.

Un composant qui ne trouve pas sa feature est un signal de conception : une feature manque, ou un
nom désigne une route plutôt qu'une ability. S'il sert plusieurs features, il va dans les
composants partagés ou dans les bibliothèques.

### Une page fait quatre choses, dans cet ordre

1. **Contrôler l'accès** : l'authentification et le droit sur la ressource.
2. **Préparer les entrées** : les paramètres sont lus par un schéma ou par un value object.
3. **Récupérer les données** : par une ability, jamais directement dans la base. Si rien n'est
   trouvé, la page est introuvable.
4. **Rendre** un seul composant page de la feature, alimenté par un presenter.

### Les server actions ne sont jamais déclarées en ligne

Une server action ne vit que dans son fichier dédié, jamais dans une page ou une route. Elle est
passée en prop au composant de la feature. Ses paramètres, comme l'identifiant de la ressource à
modifier, transitent par les valeurs du formulaire et non par une closure.

### La route câble les features entre elles

Quand une page assemble plusieurs features :

- la feature consommatrice déclare ce qu'elle attend, sous forme de port ou de paramètre ;
- la feature fournisseuse expose une fonction à paramètres simples, compatible avec cette attente ;
- la route ou l'action passe cette fonction à la consommatrice, quitte à répéter ce câblage d'une
  route à l'autre ;
- aucun fichier d'assemblage ne vit dans `app/`.

Les formes d'injection acceptées sont le conteneur d'injection, le composant passé en prop et le
paramètre.

## Alternatives écartées

### Le critère « pas de composant dans `app/` »

C'était la première formulation de la règle. Elle laissait dans le dossier de routage des fichiers
qui ne sont pas des composants mais n'ont rien de Next, comme les chargeurs de données. Le critère
du couplage au framework la remplace.

### Des fichiers de composition dans `app/` ou dans un dossier de composition central

Ces fichiers contiennent de la logique qui n'a rien de Next, et deviennent des carrefours que
personne ne possède.

### Un constructeur de pages générique à middlewares enchaînés

Il imposerait les quatre étapes par le code. Il n'est pas adopté : une route d'une quarantaine de
lignes qui écrit les quatre étapes directement reste lisible.

## Conséquences

Positives :

- Une route se lit en quatre étapes, sans logique cachée.
- Le code métier ne dépend plus de Next par son emplacement.
- Un composant de page reçoit toutes ses données en props : il se rend seul, dans un test ou dans
  Storybook.
- Une server action a toujours son fichier et, si elle reçoit une entrée, la valide par un schéma.

Négatives :

- Le câblage entre features se répète d'une route à l'autre.
- Les routes importent parfois profondément dans une ability, plutôt que par un point d'entrée.
- La migration n'est pas terminée : des fichiers restent à trier dans `app/`, et deux routes de
  déconnexion lisent encore la base directement. Cible à atteindre, ticket à ouvrir.
- Le dossier de composition central existe encore et contredit la règle. Cible à atteindre, ticket
  à ouvrir.

## Où trouver le détail

Les abilities de chaque feature décrivent les comportements que les pages exposent ; ce sont des
specs exécutables, jouées par les tests, et elles font foi. Les règles normatives sur la route
mince, l'absence de composant dans le dossier de routage et les presenters sont les règles AR-5,
UI-1 et UI-4 des
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md).

## Références

- [ADR-004 : Architecture par features et abilities](./0004-architecture-par-features-et-abilities.md)
- [ADR-006 : Server actions et injection, à la place de tRPC](./0006-server-actions-et-injection.md)
- [`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md) — règles AR-5, UI-1 et UI-4
