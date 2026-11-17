# ADR-005 : Domaine modélisé par des value objects brandés

## Auteurs et historique

| Date       | Auteur        | Action                                                    |
| ---------- | ------------- | --------------------------------------------------------- |
| 2026-11-17 | Marc Gavanier | Rédaction de l'ADR a posteriori, d'après l'historique git |

## Statut

Accepté

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

Le découpage du code en features et en abilities, posé par
l'[ADR-004](./adr-004-architecture-par-features-et-abilities.md), donne à chaque feature un
domaine à elle ; cet ADR décide comment ce domaine se modélise.

## Décision

Le domaine ne manipule que des valeurs validées par construction : chaque primitif métier est un
value object brandé, chaque état une union discriminée. Le domaine est pur, et une couche de
transfert le sépare de la base en validant ce qu'elle relit.

### Tout primitif métier est un value object brandé

Un value object se déclare avec `defineModel` sur un schéma Zod terminé par `.brand()`.
`defineModel` rend un smart constructor : une fonction qui valide son entrée et rend la valeur
brandée, ou lève une exception.

- Le smart constructor est le seul moyen de créer une valeur. Jamais de `as`.
- La validation et la normalisation (casse, espaces, format) vivent dans le schéma. C'est la
  seule place qui survit quand le schéma d'un value object est imbriqué dans un autre.
- `Model.safe` rend `null` au lieu de lever. Il est réservé aux frontières où l'on lit des
  données non fiables (base héritée, API externe).
- Les timestamps système et les identifiants techniques sans règle propre ne sont pas brandés.

### Les états se modélisent par des unions discriminées

- Un booléen qui conditionne d'autres champs devient une union discriminée.
- Deux champs qui codent un seul état deviennent une union.
- Un `null` qui cache un état devient une union. Un `null` qui est une valeur d'enum devient
  cette valeur.
- Des champs toujours utilisés ensemble forment un value object composite.
- Tous les champs d'une entité sont `readonly`.

### Le domaine est pur

Les fonctions du domaine prennent et rendent des valeurs validées. Elles n'ont pas d'effet et
n'importent ni Prisma, ni Next, ni React.

### Le transfert est la frontière avec la base

Le dossier `db` de la feature traduit entre Prisma et le domaine :

- de la base vers le domaine, par les smart constructors : la base est validée à la lecture ;
- du domaine vers la base, par simple assignation : un type brandé reste assignable à son type
  de base ;
- ni `as` ni assertion non nulle ;
- un test aller-retour par transfert : domaine, puis base, puis domaine rend la même valeur, sur
  un cas minimal et un cas maximal.

## Alternatives écartées

### Garder les types générés par Prisma comme types du domaine

C'était l'état de départ. Le domaine suivait alors le schéma de la base, nulls et colonnes
redondantes compris, et aucune règle métier n'avait de place à elle.

### Une bibliothèque de modélisation plus complète, comme Effect

Elle aurait apporté des schémas et des erreurs typées plus riches. Elle a été jugée trop lourde
à introduire dans une base existante. Zod était déjà utilisé dans le dépôt ; son `.brand()`
suffit à distinguer les types.

### Des types nominaux faits à la main, avec des fonctions de validation séparées

Le type et sa validation pourraient alors diverger. Avec `defineModel`, le schéma est la seule
source du type, de la validation et de la normalisation.

### Un préprocesseur passé à `defineModel`

Il n'était appliqué que par le smart constructor, pas quand le schéma était composé dans un
autre : un value object imbriqué passait la validation sans être normalisé. Il a été retiré au
profit de la normalisation dans le schéma.

## Conséquences

Positives :

- Une valeur du domaine a été validée, par construction.
- Le compilateur refuse de passer un identifiant de médiateur là où un identifiant de
  bénéficiaire est attendu.
- Les combinaisons de colonnes incohérentes n'ont plus de représentation dans le domaine.
- Les tests aller-retour détectent une perte d'information dans le transfert.
- Une donnée invalide en base est repérée à la lecture, au lieu de s'afficher.

Négatives :

- Un transfert strict refuse des lignes que l'ancien code tolérait. Il a fallu des jobs de
  normalisation des données, et une variante tolérante du smart constructor pour les lectures
  qui doivent le rester.
- Plus de code : un fichier par value object, un transfert et son test par entité.
- Indexer une table par une valeur brandée ne compile pas directement. Les enums de la feature
  bénéficiaire ont perdu leur brand pour cette raison ; les features plus récentes gardent le
  brand et lisent leurs tables par une fonction typée.

## Où trouver le détail

Les règles normatives du modèle de domaine (value objects, unions, pureté, transfert et tests
aller-retour) sont dans la section 2 des
[conventions d'architecture des features](../../.claude/conventions/feature-architecture.md).

## Références

- [ADR-004 : Architecture par features et abilities](./adr-004-architecture-par-features-et-abilities.md)
- [`.claude/conventions/feature-architecture.md`](../../.claude/conventions/feature-architecture.md) — section 2, modèle de domaine
