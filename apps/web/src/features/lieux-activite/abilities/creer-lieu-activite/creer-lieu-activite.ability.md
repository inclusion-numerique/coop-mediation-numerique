# Feature: Créer un lieu d'activité

> On n'arrive sur ce formulaire qu'après une recherche par nom, adresse ou SIRET
> restée sans résultat. C'est une garde d'écran, pas une garantie : rien
> n'empêche d'y venir directement, ni d'y ressaisir un lieu que la recherche
> n'avait pas su rendre — une dénomination différente suffit. L'ability ne s'en
> remet donc pas à elle.

## Rule: Créer un lieu, c'est s'y rattacher

### Scenario: Le créateur exerce aussitôt dans le lieu créé

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* Then le lieu créé existe
* And ce médiateur exerce dans le lieu créé

## Rule: Seul un médiateur crée un lieu

### Scenario: Sans médiateur, la création est refusée

* Given un médiateur qui exerce dans un lieu
* When quelqu'un sans médiateur tente de créer un lieu
* Then la création est refusée

## Rule: On ne crée jamais un lieu que la coop connaît déjà

> La sonde de corrélation juge sur ce qui désigne un ENDROIT — la dénomination,
> à la même adresse, dans la même commune. Le lieu rendu est celui qu'on a
> rejoint, qui n'est pas toujours celui qu'on venait construire.

### Scenario: Ressaisir un lieu existant rejoint celui-ci

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* And ce médiateur ressaisit le même lieu
* Then les deux créations désignent le même lieu

### Scenario: Le lieu rejoint n'est pas dupliqué

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* And ce médiateur ressaisit le même lieu
* Then ce médiateur n'exerce qu'une fois dans le lieu créé

## Rule: « Tout public » se traduit par l'absence de public visé

### Scenario: Un lieu tout public ne vise personne en particulier

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* Then le lieu créé ne vise aucun public en particulier

## Rule: Les horaires portent leur commentaire une seule fois

> La saisie composait déjà la chaîne OpenStreetMap avec son commentaire, et le
> mapper la recomposait : `appendComment` ajoutant plutôt que remplaçant, le
> commentaire s'écrivait deux fois. Les horaires ne se composent plus qu'à un
> seul endroit, à partir de la grille.

### Scenario: Le commentaire n'apparaît qu'une fois dans les horaires

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu ouvert le lundi matin avec un commentaire d'horaires
* Then les horaires du lieu créé portent le commentaire une seule fois

## Rule: Ce que le médiateur saisit part aussi au registre de l'Entrepôt

> La coop n'est plus seule à porter la fiche. Chaque création s'inscrit du même
> geste dans `main.lieu_inclusion`, sous le lien `structure_coop_id`, et
> l'adresse s'y résout dans `main.adresse`, mutualisée entre lieux — on l'y
> retrouve plutôt que de la réécrire.

### Scenario: Le lieu créé paraît au registre

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* Then le lieu créé est inscrit au registre
* And le registre porte l'adresse du lieu créé

### Scenario: Rejoindre un lieu existant n'inscrit rien de neuf

> On n'y crée pas de fiche : le registre n'a rien de nouveau à apprendre.

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* And ce médiateur ressaisit le même lieu
* Then le registre ne porte qu'une inscription pour le lieu créé

### Scenario: Une adresse que l'Entrepôt connaît déjà est réutilisée, pas recréée

> `main.adresse` est mutualisée et sa clé d'unicité compare des `COALESCE` : une
> répétition vide et une répétition nulle y désignent la même adresse. 13 118
> lignes portent la première. Chercher en `IS NULL` les manquerait, et
> l'insertion échouerait en plein enregistrement du médiateur.

* Given un médiateur qui exerce dans un lieu
* And une adresse déjà connue de l'Entrepôt, à répétition vide
* When ce médiateur crée un lieu à cette adresse
* Then le registre pointe vers l'adresse que l'Entrepôt connaissait déjà

### Scenario: Un lieu que le registre connaît déjà sous une autre source est adopté, pas inscrit deux fois

> La sonde de la coop ne regarde que `coop.lieu_inclusion` : un lieu moissonné
> chez `dora` n'y figure pas, et la fiche coop se crée donc à bon droit. C'est au
> moment d'inscrire au registre, et là seulement, qu'on peut éviter d'y ajouter
> une seconde ligne pour le même endroit. L'inscription trouvée est reprise — et
> passe à la coop, puisque c'est d'elle que viennent désormais les valeurs qu'on y
> lit.

* Given un médiateur qui exerce dans un lieu
* And le registre connaît déjà ce lieu sous la source « dora »
* When ce médiateur crée un lieu déjà connu du registre
* Then le registre ne porte qu'une inscription pour cet endroit
* And cette inscription porte le lien vers le lieu créé
* And cette inscription est désormais attribuée à la coop

## Rule: La coop n'efface pas au registre ce qu'elle ne sait pas dire

> Adopter une inscription, ce n'est pas la reprendre en entier. Elle vient d'un
> producteur qui en sait plus que le formulaire d'où on l'adopte : `dispositif
> programmes nationaux` et `autres formations labels` n'ont aucun champ dans la
> coop, et les sections détaillées ne s'ouvrent que si le médiateur partage son
> lieu à la cartographie. Écrire toutes les colonnes viderait chez lui ce que la
> coop n'avait aucun moyen de renseigner.

### Scenario: Une création sans partage ne vide rien de la fiche adoptée

* Given un médiateur qui exerce dans un lieu
* And le registre connaît déjà ce lieu sous la source « dora »
* When ce médiateur crée un lieu déjà connu du registre
* Then cette inscription garde ce qu'aucun formulaire de la coop ne porte
* And cette inscription garde ce que le formulaire ne montrait pas

### Scenario: Une création partagée remplace ce que le formulaire montrait

> Le partage à la cartographie ouvre toutes les sections : le médiateur les a
> sous les yeux, et un champ qu'il laisse vide est une décision. Les deux
> colonnes qu'aucun formulaire ne porte survivent malgré tout.

* Given un médiateur qui exerce dans un lieu
* And le registre connaît déjà ce lieu sous la source « dora »
* When ce médiateur crée en le partageant un lieu déjà connu du registre
* Then cette inscription porte les services saisis
* And cette inscription a perdu les horaires que la coop a laissés vides
* And cette inscription garde ce qu'aucun formulaire de la coop ne porte
