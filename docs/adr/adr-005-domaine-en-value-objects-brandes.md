# ADR-005 : Domaine modélisé par des value objects brandés

## Auteurs et historique

| Date       | Auteur        | Action                                                                                                                                                                                                                                                                     |
| ---------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-29 | Marc Gavanier | Domaine pur de `beneficiaire`, indépendant de Prisma, avec une couche de transfert dédiée (`f86c408ae`, PR #488)                                                                                                                                                           |
| 2026-04-29 | Marc Gavanier | `libraries/model` et `defineModel` ; chaque primitive du bénéficiaire devient un value object ; unions `BeneficiaireAnonyme \| BeneficiaireIdentifie` et `ContactTelephone` ; `null` remplacé par `NonCommunique` ; tests aller-retour du transfert (`c02c0e8ec`, PR #488) |
| 2026-04-30 | Marc Gavanier | Les enums de `beneficiaire` (`Genre`, `TrancheAge`, `StatutSocial`) perdent leur brand, qui gênait l'indexation des tables de libellés (`e692e84ce`, PR #488)                                                                                                              |
| 2026-07-10 | Marc Gavanier | `Model.safe` : forme du smart constructor qui rend `null` au lieu de lever une exception, réservée aux frontières de lecture de données non fiables (`4e8ed3bf6`, PR #566)                                                                                                 |
| 2026-08-04 | Marc Gavanier | `defineModel` n'accepte plus de préprocesseur : la normalisation se pose dans le schéma, seul endroit qui survit à la composition (`fa54a22da`, PR #575)                                                                                                                   |
| 2026-10-27 | Marc Gavanier | Un `domain/` ne se réduit pas à des types de props ou à des primitives : booléens remplacés par des enums (`Coordination`, `Dispositif`, `VisibiliteDuLieu`), compteurs et dates en value objects (PR #704)                                                                |
| 2026-11-10 | Marc Gavanier | Identifiants INSEE réunis dans `libraries/insee`, une seule définition stricte (PR #724)                                                                                                                                                                                   |
| 2026-11-10 | Marc Gavanier | L'activité de médiation devient une union discriminée ; le transfert relit la base strictement (PR #724)                                                                                                                                                                   |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git                                                                                                                                                                                                                  |

## Statut

Accepté — `defineModel` est utilisé par 15 des 16 features découpées en abilities ;
`statistiques` n'en déclare pas, elle reçoit ses données des autres features. Le domaine de
`beneficiaire`, le plus ancien, garde des enums sans brand.

## Contexte

Avant la refacto, le domaine se confondait avec le schéma Prisma. Un bénéficiaire était une
ligne de table : des `string | null`, des booléens et des champs qui ne prennent leur sens
qu'ensemble. Par exemple :

- `telephone` et `pasDeTelephone` décrivaient un seul état sur deux colonnes ;
- `anonyme` décidait quels autres champs avaient le droit d'être remplis ;
- `null` voulait dire tantôt « non renseigné », tantôt « non communiqué ».

La validation existait aux entrées (schémas de formulaire et de procédure tRPC), mais rien ne
validait ce qui était relu en base : une valeur invalide pouvait aller jusqu'à l'écran. Le
compilateur ne distinguait pas un identifiant de médiateur d'un identifiant de bénéficiaire :
ce sont deux `string`.

## Décision

### Tout primitif métier est un value object brandé

Un value object se déclare avec `defineModel` (`apps/web/src/libraries/model`) sur un schéma
Zod terminé par `.brand('Nom')` (DM-1). `defineModel` rend un smart constructor : une fonction
qui valide son entrée et rend la valeur brandée, ou lève une exception.

- Le smart constructor est le seul moyen de créer une valeur. Jamais de `as` (DM-2, CS-5).
- La validation et la normalisation (casse, espaces, format) vivent dans le schéma. C'est la
  seule place qui survit quand le `.schema` d'un value object est imbriqué dans un autre.
- `Model.safe` rend `null` au lieu de lever. Il est réservé aux frontières où l'on lit des
  données non fiables (base héritée, API externe).
- Les timestamps système et les identifiants techniques sans règle propre ne sont pas brandés
  (DM-1bis).

### Les états se modélisent par des unions discriminées

- Un booléen qui conditionne d'autres champs devient une union discriminée (DM-4).
- Deux champs qui codent un seul état deviennent une union (DM-5), comme `ContactTelephone`.
- Un `null` qui cache un état devient une union (DM-3). Un `null` qui est une valeur d'enum
  devient cette valeur, par exemple `NonCommunique` (DM-6).
- Des champs toujours utilisés ensemble forment un value object composite (DM-7).
- Tous les champs d'une entité sont `readonly` (DM-9).

### Le domaine est pur

Les fonctions du domaine prennent et rendent des valeurs validées. Elles n'ont pas d'effet et
n'importent ni Prisma, ni Next, ni React (DM-8, AR-1). Le parsing se fait à la frontière.

### Le transfert est la frontière avec la base

Le dossier `db/` de la feature traduit entre Prisma et le domaine (DM-10) :

- de la base vers le domaine, par les smart constructors : la base est validée à la lecture ;
- du domaine vers la base, par simple assignation : un type brandé reste assignable à son type
  de base ;
- ni `as` ni `!` ; une valeur par défaut avec `??` puis le smart constructor décide ;
- un test aller-retour par transfert : domaine → base → domaine rend la même valeur, sur un cas
  minimal et un cas maximal (TS-4).

Le détail normatif est dans
[`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md),
section 2.

## Alternatives écartées

### Garder les types générés par Prisma comme types du domaine

C'était l'état de départ. Le domaine suivait alors le schéma de la base, nulls et colonnes
redondantes compris, et aucune règle métier n'avait de place à elle.

### Une bibliothèque de modélisation plus complète, comme Effect

Elle aurait apporté des schémas et des erreurs typées plus riches. Elle a été jugée trop lourde
à introduire dans une base existante. Zod était déjà utilisé dans le dépôt ; son `.brand()`
suffit à distinguer les types.

### Des types nominaux à la main (`string & { __brand }`) avec des fonctions de validation séparées

Le type et sa validation pourraient alors diverger. Avec `defineModel`, le schéma est la seule
source du type, de la validation et de la normalisation.

### Un préprocesseur passé à `defineModel`

Il a existé jusqu'au 04/08/2026. Il n'était appliqué que par le smart constructor, pas quand le
schéma était composé dans un autre : un value object imbriqué passait la validation sans être
normalisé. Il a été retiré (`fa54a22da`).

## Conséquences

Positives :

- Une valeur du domaine a été validée, par construction.
- Le compilateur refuse de passer un `MediateurId` là où un `BeneficiaireId` est attendu.
- Les combinaisons de colonnes incohérentes n'ont plus de représentation dans le domaine.
- Les tests aller-retour détectent une perte d'information dans le transfert.
- Une donnée invalide en base est repérée à la lecture, au lieu de s'afficher.

Négatives :

- Un transfert strict refuse des lignes que l'ancien code tolérait. Il a fallu des jobs de
  normalisation des données, et `Model.safe` pour les lectures tolérantes.
- Plus de code : un fichier par value object, un transfert et son test par entité.
- Indexer une table par une valeur brandée ne compile pas directement. Les enums de
  `beneficiaire` ont perdu leur brand pour cette raison ; les features plus récentes gardent le
  brand et lisent leurs tables par une fonction typée.
- Cinq transferts n'ont pas encore de test aller-retour au 17/11/2026 :
  `activites/db/activite-consultee.transfer.ts`, `rdvsp/db/entourage.transfer.ts`,
  `utilisateurs/db/identite.transfer.ts`, `utilisateurs/db/ligne-utilisateur.transfer.ts`,
  `utilisateurs/db/production.transfer.ts`.

## Références

- `apps/web/src/libraries/model/index.ts`
- [`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md) — DM-1 à DM-10, AR-1, CS-5, TS-3, TS-4
- ADR-004 : architecture par features et abilities

## ADR liés

- [ADR-004 : Architecture par features et abilities](./adr-004-architecture-par-features-et-abilities.md)
- [ADR-008 : Un scénario BDD par ability, Vitest sans isolation ni mock](./adr-008-strategie-de-tests.md)
