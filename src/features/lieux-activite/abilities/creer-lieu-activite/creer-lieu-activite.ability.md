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

### Scenario: Un lieu sans adresse reconnue par la BAN n'est jamais rejoint

* Given un médiateur qui exerce dans un lieu
* When ce médiateur crée un lieu « Tiers-lieu du Port »
* And le lieu créé perd son adresse reconnue par la BAN
* And ce médiateur ressaisit le même lieu
* Then les deux créations désignent deux lieux distincts

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

## Rule: Créer un lieu d’activité ne le crée que si la coop l’ignore

On n’arrive au formulaire de création qu’après une recherche restée sans
résultat — mais c’est une garde de l’écran, pas une preuve : rien n’empêche d’y
venir directement, ni d’y ressaisir un lieu que la recherche n’avait pas su
rendre. La corrélation reste donc le dernier rempart.

### Scenario: Créer un lieu déjà connu sous une autre dénomination rattache l’existant

* Given je suis un médiateur
* And un lieu d’activité est disponible, dénommé comme une mairie
* When je crée un lieu d’activité dénommé comme la commune, à la même adresse
* Then ce lieu est un de mes lieux d’activité actifs
* And aucun autre lieu d’activité n’a été créé

## Rule: Un lieu retiré de la cartographie ne réapparaît pas par ré-inscription

Rendre un lieu visible sur la cartographie nationale se décide ; le retirer aussi.
Une suppression est un acte de modération. La ré-inscription ne doit jamais la
défaire silencieusement : un lieu supprimé n'est relevé que sur corrélation forte
(la même dénomination au même endroit — un SIRET n'y suffit pas), et il revient
invisible de la cartographie — la visibilité se re-décide.

### Scenario: Un lieu supprimé, corrélé fortement, est relevé mais reste invisible

* Given je suis un médiateur
* And un lieu d’activité identique a été retiré de la cartographie par la modération
* When je crée un lieu d’activité identique à ce lieu retiré
* Then le lieu créé est un de mes lieux d’activité actifs
* And ce lieu n’est pas visible sur la cartographie nationale
* And je n’ai qu’un seul lieu d’activité actif

### Scenario: Un simple homonyme ne ressuscite pas un lieu supprimé

* Given je suis un médiateur
* And un lieu d’activité supprimé porte un nom qu’un autre lieu contient
* When je crée un lieu d’activité dont le nom contient celui du lieu supprimé, à une autre adresse
* Then le lieu supprimé n’a pas été relevé
* And je n’ai qu’un seul lieu d’activité actif

## Rule: Deux antennes d’une même enseigne restent deux lieux

Une enseigne ouvre plusieurs sites dans une même commune : « LA POSTE » ou
« COMMUNE DE TOULON » y ont plusieurs adresses. Ce qui les sépare est leur
adresse. Rapprocher un lieu de son homonyme sur le seul nom les fusionnerait et
perdrait l’adresse du lieu absorbé. En cas de doute on ne fusionne pas : un
doublon se détecte et se répare, une fusion à tort ne laisse aucune trace.

### Scenario: Un homonyme à une autre adresse reste un lieu distinct

* Given je suis un médiateur
* And un lieu d’activité est disponible
* When je crée un lieu d’activité de même nom, à une autre adresse
* Then un second lieu d’activité a été créé
* And je n’ai qu’un seul lieu d’activité actif

## Rule: La commune se reconnaît au-delà de son code INSEE

Paris, Lyon et Marseille sont désignées tantôt par leur code de commune, tantôt
par celui de l’arrondissement ; une commune nouvelle change de code sans
déménager. Le périmètre de recherche s’appuie donc aussi sur le code postal et
le libellé de commune. Deux villages partageant un code postal restent, eux,
deux communes distinctes.

### Scenario: Un lieu enregistré sous le code de la commune est reconnu depuis l’arrondissement

* Given je suis un médiateur
* And un lieu d’activité est disponible, enregistré sous le code INSEE de la commune
* When je crée un lieu d’activité de même nom et même adresse, sous le code INSEE de l’arrondissement
* Then ce lieu est un de mes lieux d’activité actifs
* And je n’ai qu’un seul lieu d’activité actif

### Scenario: Deux communes partageant un code postal restent distinctes

* Given je suis un médiateur
* And un lieu d’activité est disponible dans une commune voisine du même code postal
* When je crée un lieu d’activité de même nom et même adresse, dans ma commune
* Then un second lieu d’activité a été créé
* And je n’ai qu’un seul lieu d’activité actif

## Rule: Un libellé non diffusible ne désigne personne

L’INSEE rend « [Non diffusible] » pour les établissements qui refusent la
diffusion de leurs données — nom comme adresse. Deux établissements non
diffusibles ne sont pas le même : les rapprocher les fusionnerait tous.

### Scenario: Deux lieux non diffusibles ne sont pas rapprochés

* Given je suis un médiateur
* And un lieu d’activité non diffusible est disponible
* When je crée un lieu d’activité non diffusible à la même adresse
* Then un second lieu d’activité a été créé
* And je n’ai qu’un seul lieu d’activité actif

## Rule: Un lieu sans adresse n’est jamais reconnu

Un lieu est un endroit : sans adresse, plus rien ne dit OÙ il se trouve, et une
commune compte plusieurs « Association Trait d’Union ». Aucun parcours n’en crée
plus — la création, le renseignement et la matérialisation d’une employeuse
exigent tous une adresse reconnue.

Ceux qui subsistent en base pour des raisons historiques ne sont exploitables
nulle part dans la coop, sauf dans le formulaire de modification qui permet de
leur donner une adresse. Ils ne sont donc jamais candidats au rapprochement :
un lieu du même nom est créé à part.

### Scenario: Un lieu sans adresse n’est jamais reconnu, même sous le même nom

* Given je suis un médiateur
* And un lieu d’activité sans adresse est disponible
* When je crée un lieu d’activité de même nom, avec une adresse
* Then un second lieu d’activité a été créé
* And je n’ai qu’un seul lieu d’activité actif

## Rule: Deux libellés d’une même adresse désignent le même emplacement

L’adresse enregistrée n’est pas toujours celle que la Base Adresse Nationale
rend pour le même point : abréviations (« PL DU HUIT MAI 1945 » / « Place du
8 Mai 1945 »), complément en préfixe, numéro de voie absent d’un côté. Les
coordonnées, elles, tombent au même endroit — et la quasi-totalité des lieux en
portent. À dénomination correspondante et dans la même commune, deux points
distants de moins de cinquante mètres sont le même établissement.

### Scenario: Un lieu retrouvé par ses coordonnées malgré une adresse écrite autrement

* Given je suis un médiateur
* And un lieu d’activité est disponible, dont l’adresse est écrite en abrégé
* When je crée un lieu d’activité de même nom, à la même position mais sous l’adresse complète
* Then ce lieu est un de mes lieux d’activité actifs
* And je n’ai qu’un seul lieu d’activité actif

### Scenario: Un lieu du même nom à l’autre bout de la commune reste distinct

* Given je suis un médiateur
* And un lieu d’activité est disponible, dont l’adresse est écrite en abrégé
* When je crée un lieu d’activité de même nom, à une autre position de la commune
* Then un second lieu d’activité a été créé
* And je n’ai qu’un seul lieu d’activité actif
