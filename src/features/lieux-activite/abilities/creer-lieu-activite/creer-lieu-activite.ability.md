# Fonctionnalité: Créer un lieu d'activité

> On n'arrive sur ce formulaire qu'après une recherche par nom, adresse ou SIRET
> restée sans résultat. C'est une garde d'écran, pas une garantie : rien
> n'empêche d'y venir directement, ni d'y ressaisir un lieu que la recherche
> n'avait pas su rendre — une dénomination différente suffit. L'ability ne s'en
> remet donc pas à elle.

## Règle: Créer un lieu, c'est s'y rattacher

### Scénario: Le créateur exerce aussitôt dans le lieu créé

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur crée un lieu « Tiers-lieu du Port »
* Alors le lieu créé existe
* Et ce médiateur exerce dans le lieu créé

## Règle: Seul un médiateur crée un lieu

### Scénario: Sans médiateur, la création est refusée

* Étant donné un médiateur qui exerce dans un lieu
* Quand quelqu'un sans médiateur tente de créer un lieu
* Alors la création est refusée

## Règle: On ne crée jamais un lieu que la coop connaît déjà

> La sonde de corrélation juge sur ce qui désigne un ENDROIT — la dénomination,
> à la même adresse, dans la même commune. Le lieu rendu est celui qu'on a
> rejoint, qui n'est pas toujours celui qu'on venait construire.

### Scénario: Ressaisir un lieu existant rejoint celui-ci

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur crée un lieu « Tiers-lieu du Port »
* Et ce médiateur ressaisit le même lieu
* Alors les deux créations désignent le même lieu

### Scénario: Le lieu rejoint n'est pas dupliqué

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur crée un lieu « Tiers-lieu du Port »
* Et ce médiateur ressaisit le même lieu
* Alors ce médiateur n'exerce qu'une fois dans le lieu créé

### Scénario: Un lieu sans adresse reconnue par la BAN n'est jamais rejoint

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur crée un lieu « Tiers-lieu du Port »
* Et le lieu créé perd son adresse reconnue par la BAN
* Et ce médiateur ressaisit le même lieu
* Alors les deux créations désignent deux lieux distincts

## Règle: « Tout public » se traduit par l'absence de public visé

### Scénario: Un lieu tout public ne vise personne en particulier

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur crée un lieu « Tiers-lieu du Port »
* Alors le lieu créé ne vise aucun public en particulier

## Règle: Les horaires portent leur commentaire une seule fois

> La saisie composait déjà la chaîne OpenStreetMap avec son commentaire, et le
> mapper la recomposait : `appendComment` ajoutant plutôt que remplaçant, le
> commentaire s'écrivait deux fois. Les horaires ne se composent plus qu'à un
> seul endroit, à partir de la grille.

### Scénario: Le commentaire n'apparaît qu'une fois dans les horaires

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur crée un lieu ouvert le lundi matin avec un commentaire d'horaires
* Alors les horaires du lieu créé portent le commentaire une seule fois

## Règle: Ce que le médiateur saisit part aussi au registre de l'Entrepôt

> La coop n'est plus seule à porter la fiche. Chaque création s'inscrit du même
> geste dans `main.lieu_inclusion`, sous le lien `structure_coop_id`, et
> l'adresse s'y résout dans `main.adresse`, mutualisée entre lieux — on l'y
> retrouve plutôt que de la réécrire.

### Scénario: Le lieu créé paraît au registre

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur crée un lieu « Tiers-lieu du Port »
* Alors le lieu créé est inscrit au registre
* Et le registre porte l'adresse du lieu créé

### Scénario: Rejoindre un lieu existant n'inscrit rien de neuf

> On n'y crée pas de fiche : le registre n'a rien de nouveau à apprendre.

* Étant donné un médiateur qui exerce dans un lieu
* Quand ce médiateur crée un lieu « Tiers-lieu du Port »
* Et ce médiateur ressaisit le même lieu
* Alors le registre ne porte qu'une inscription pour le lieu créé

### Scénario: Une adresse que l'Entrepôt connaît déjà est réutilisée, pas recréée

> `main.adresse` est mutualisée et sa clé d'unicité compare des `COALESCE` : une
> répétition vide et une répétition nulle y désignent la même adresse. 13 118
> lignes portent la première. Chercher en `IS NULL` les manquerait, et
> l'insertion échouerait en plein enregistrement du médiateur.

* Étant donné un médiateur qui exerce dans un lieu
* Et une adresse déjà connue de l'Entrepôt, à répétition vide
* Quand ce médiateur crée un lieu à cette adresse
* Alors le registre pointe vers l'adresse que l'Entrepôt connaissait déjà

### Scénario: Un lieu que le registre connaît déjà sous une autre source est adopté, pas inscrit deux fois

> La sonde de la coop ne regarde que `coop.lieu_inclusion` : un lieu moissonné
> chez `dora` n'y figure pas, et la fiche coop se crée donc à bon droit. C'est au
> moment d'inscrire au registre, et là seulement, qu'on peut éviter d'y ajouter
> une seconde ligne pour le même endroit. L'inscription trouvée est reprise — et
> passe à la coop, puisque c'est d'elle que viennent désormais les valeurs qu'on y
> lit.

* Étant donné un médiateur qui exerce dans un lieu
* Et le registre connaît déjà ce lieu sous la source « dora »
* Quand ce médiateur crée un lieu déjà connu du registre
* Alors le registre ne porte qu'une inscription pour cet endroit
* Et cette inscription porte le lien vers le lieu créé
* Et cette inscription est désormais attribuée à la coop

## Règle: La coop n'efface pas au registre ce qu'elle ne sait pas dire

> Adopter une inscription, ce n'est pas la reprendre en entier. Elle vient d'un
> producteur qui en sait plus que le formulaire d'où on l'adopte : `dispositif
> programmes nationaux` et `autres formations labels` n'ont aucun champ dans la
> coop, et les sections détaillées ne s'ouvrent que si le médiateur partage son
> lieu à la cartographie. Écrire toutes les colonnes viderait chez lui ce que la
> coop n'avait aucun moyen de renseigner.

### Scénario: Une création sans partage ne vide rien de la fiche adoptée

* Étant donné un médiateur qui exerce dans un lieu
* Et le registre connaît déjà ce lieu sous la source « dora »
* Quand ce médiateur crée un lieu déjà connu du registre
* Alors cette inscription garde ce qu'aucun formulaire de la coop ne porte
* Et cette inscription garde ce que le formulaire ne montrait pas

### Scénario: Une création partagée remplace ce que le formulaire montrait

> Le partage à la cartographie ouvre toutes les sections : le médiateur les a
> sous les yeux, et un champ qu'il laisse vide est une décision. Les deux
> colonnes qu'aucun formulaire ne porte survivent malgré tout.

* Étant donné un médiateur qui exerce dans un lieu
* Et le registre connaît déjà ce lieu sous la source « dora »
* Quand ce médiateur crée en le partageant un lieu déjà connu du registre
* Alors cette inscription porte les services saisis
* Et cette inscription a perdu les horaires que la coop a laissés vides
* Et cette inscription garde ce qu'aucun formulaire de la coop ne porte

## Règle: Créer un lieu d’activité ne le crée que si la coop l’ignore

On n’arrive au formulaire de création qu’après une recherche restée sans
résultat — mais c’est une garde de l’écran, pas une preuve : rien n’empêche d’y
venir directement, ni d’y ressaisir un lieu que la recherche n’avait pas su
rendre. La corrélation reste donc le dernier rempart.

> Le jugement « deux fiches désignent le même endroit » appartient au standard
> `@gouvfr-anct/lieux-de-mediation-numerique`, d'où la coop, mednum-cli et les
> producteurs de données le tirent : deux règles concurrentes feraient deux
> vérités. La coop n'y ajoute que ce que le standard ne peut pas savoir. Son
> seuil, d'abord : 80, celui de la cartographie nationale établi sur ses 21 000
> lieux, dernier palier qui n'admet aucune paire aux dénominations franchement
> divergentes. Le départage ensuite : un lieu actif avant un lieu supprimé, le
> mieux noté, puis le plus ancien. Une typologie que le standard ne connaît pas
> est laissée de côté plutôt que de faire refuser le lieu, et à défaut de
> typologie le standard la déduit de la dénomination : opposer « France services
> de Fleury » à « Mairie de Fleury » crée au pire un doublon, là où les confondre
> rattacherait quelqu'un à l'établissement d'un autre.

### Scénario: Créer un lieu déjà connu sous une autre dénomination rattache l’existant

* Étant donné je suis un médiateur
* Et un lieu d’activité est disponible, dénommé comme une mairie
* Quand je crée un lieu d’activité dénommé comme la commune, à la même adresse
* Alors ce lieu est un de mes lieux d’activité actifs
* Et aucun autre lieu d’activité n’a été créé

## Règle: Un lieu retiré de la cartographie ne réapparaît pas par ré-inscription

Rendre un lieu visible sur la cartographie nationale se décide ; le retirer aussi.
Une suppression est un acte de modération. La ré-inscription ne doit jamais la
défaire silencieusement : un lieu supprimé n'est relevé que sur corrélation forte
(la même dénomination au même endroit — un SIRET n'y suffit pas), et il revient
invisible de la cartographie — la visibilité se re-décide.

### Scénario: Un lieu supprimé, corrélé fortement, est relevé mais reste invisible

* Étant donné je suis un médiateur
* Et un lieu d’activité identique a été retiré de la cartographie par la modération
* Quand je crée un lieu d’activité identique à ce lieu retiré
* Alors le lieu créé est un de mes lieux d’activité actifs
* Et ce lieu n’est pas visible sur la cartographie nationale
* Et je n’ai qu’un seul lieu d’activité actif

### Scénario: Un simple homonyme ne ressuscite pas un lieu supprimé

* Étant donné je suis un médiateur
* Et un lieu d’activité supprimé porte un nom qu’un autre lieu contient
* Quand je crée un lieu d’activité dont le nom contient celui du lieu supprimé, à une autre adresse
* Alors le lieu supprimé n’a pas été relevé
* Et je n’ai qu’un seul lieu d’activité actif

## Règle: Deux antennes d’une même enseigne restent deux lieux

Une enseigne ouvre plusieurs sites dans une même commune : « LA POSTE » ou
« COMMUNE DE TOULON » y ont plusieurs adresses. Ce qui les sépare est leur
adresse. Rapprocher un lieu de son homonyme sur le seul nom les fusionnerait et
perdrait l’adresse du lieu absorbé. En cas de doute on ne fusionne pas : un
doublon se détecte et se répare, une fusion à tort ne laisse aucune trace.

### Scénario: Un homonyme à une autre adresse reste un lieu distinct

* Étant donné je suis un médiateur
* Et un lieu d’activité est disponible
* Quand je crée un lieu d’activité de même nom, à une autre adresse
* Alors un second lieu d’activité a été créé
* Et je n’ai qu’un seul lieu d’activité actif

## Règle: La commune se reconnaît au-delà de son code INSEE

Paris, Lyon et Marseille sont désignées tantôt par leur code de commune, tantôt
par celui de l’arrondissement ; une commune nouvelle change de code sans
déménager. Le périmètre de recherche s’appuie donc aussi sur le code postal et
le libellé de commune. Deux villages partageant un code postal restent, eux,
deux communes distinctes.

### Scénario: Un lieu enregistré sous le code de la commune est reconnu depuis l’arrondissement

* Étant donné je suis un médiateur
* Et un lieu d’activité est disponible, enregistré sous le code INSEE de la commune
* Quand je crée un lieu d’activité de même nom et même adresse, sous le code INSEE de l’arrondissement
* Alors ce lieu est un de mes lieux d’activité actifs
* Et je n’ai qu’un seul lieu d’activité actif

### Scénario: Deux communes partageant un code postal restent distinctes

* Étant donné je suis un médiateur
* Et un lieu d’activité est disponible dans une commune voisine du même code postal
* Quand je crée un lieu d’activité de même nom et même adresse, dans ma commune
* Alors un second lieu d’activité a été créé
* Et je n’ai qu’un seul lieu d’activité actif

## Règle: Un libellé non diffusible ne désigne personne

L’INSEE rend « [Non diffusible] » pour les établissements qui refusent la
diffusion de leurs données — nom comme adresse. Deux établissements non
diffusibles ne sont pas le même : les rapprocher les fusionnerait tous.

### Scénario: Deux lieux non diffusibles ne sont pas rapprochés

* Étant donné je suis un médiateur
* Et un lieu d’activité non diffusible est disponible
* Quand je crée un lieu d’activité non diffusible à la même adresse
* Alors un second lieu d’activité a été créé
* Et je n’ai qu’un seul lieu d’activité actif

## Règle: Un lieu sans adresse n’est jamais reconnu

Un lieu est un endroit : sans adresse, plus rien ne dit OÙ il se trouve, et une
commune compte plusieurs « Association Trait d’Union ». Aucun parcours n’en crée
plus — la création, le renseignement et la matérialisation d’une employeuse
exigent tous une adresse reconnue.

Ceux qui subsistent en base pour des raisons historiques ne sont exploitables
nulle part dans la coop, sauf dans le formulaire de modification qui permet de
leur donner une adresse. Ils ne sont donc jamais candidats au rapprochement :
un lieu du même nom est créé à part.

### Scénario: Un lieu sans adresse n’est jamais reconnu, même sous le même nom

* Étant donné je suis un médiateur
* Et un lieu d’activité sans adresse est disponible
* Quand je crée un lieu d’activité de même nom, avec une adresse
* Alors un second lieu d’activité a été créé
* Et je n’ai qu’un seul lieu d’activité actif

## Règle: Deux libellés d’une même adresse désignent le même emplacement

L’adresse enregistrée n’est pas toujours celle que la Base Adresse Nationale
rend pour le même point : abréviations (« PL DU HUIT MAI 1945 » / « Place du
8 Mai 1945 »), complément en préfixe, numéro de voie absent d’un côté. Les
coordonnées, elles, tombent au même endroit — et la quasi-totalité des lieux en
portent. À dénomination correspondante et dans la même commune, deux points
distants de moins de cinquante mètres sont le même établissement.

### Scénario: Un lieu retrouvé par ses coordonnées malgré une adresse écrite autrement

* Étant donné je suis un médiateur
* Et un lieu d’activité est disponible, dont l’adresse est écrite en abrégé
* Quand je crée un lieu d’activité de même nom, à la même position mais sous l’adresse complète
* Alors ce lieu est un de mes lieux d’activité actifs
* Et je n’ai qu’un seul lieu d’activité actif

### Scénario: Un lieu du même nom à l’autre bout de la commune reste distinct

* Étant donné je suis un médiateur
* Et un lieu d’activité est disponible, dont l’adresse est écrite en abrégé
* Quand je crée un lieu d’activité de même nom, à une autre position de la commune
* Alors un second lieu d’activité a été créé
* Et je n’ai qu’un seul lieu d’activité actif
