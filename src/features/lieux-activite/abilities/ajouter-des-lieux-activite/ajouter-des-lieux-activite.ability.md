# Fonctionnalité: Ajouter des lieux d'activité

> Le médiateur constitue un panier — des lieux trouvés dans la coop, d'autres
> venus de la cartographie nationale, d'autres qu'il saisit lui-même — puis
> valide l'ensemble d'un coup.

## Règle: Ajouter un lieu, c'est y exercer

### Scénario: Un lieu déjà référencé rejoint l'activité du médiateur

* Étant donné un médiateur rattaché à deux lieux d'activité
* Et un lieu référencé dans la coop
* Quand ce médiateur ajoute ce lieu référencé
* Alors ce médiateur exerce dans ce lieu référencé

### Scénario: Un lieu que rien n'identifie est créé puis rejoint

* Étant donné un médiateur rattaché à deux lieux d'activité
* Quand ce médiateur ajoute un lieu saisi « Tiers-lieu du Port »
* Alors le lieu « Tiers-lieu du Port » existe
* Et ce médiateur exerce dans le lieu « Tiers-lieu du Port »

## Règle: On n'ajoute pas deux fois le même lieu

### Scénario: Un lieu où l'on exerce déjà n'est pas ajouté une seconde fois

* Étant donné un médiateur rattaché à deux lieux d'activité
* Quand ce médiateur ajoute un lieu où il exerce déjà
* Alors ce médiateur n'exerce toujours que dans deux lieux

### Scénario: Le même lieu deux fois dans le panier ne compte qu'une fois

* Étant donné un médiateur rattaché à deux lieux d'activité
* Et un lieu référencé dans la coop
* Quand ce médiateur ajoute deux fois ce lieu référencé
* Alors ce médiateur exerce dans trois lieux

## Règle: Un lieu saisi qui désigne un lieu connu ne crée pas de doublon

> La corrélation s'en remet au standard partagé : même adresse, dénomination
> voisine, c'est le même endroit.

### Scénario: Une saisie qui retrouve un lieu existant s'y rattache

* Étant donné un médiateur rattaché à deux lieux d'activité
* Et un lieu référencé dans la coop
* Quand ce médiateur saisit un lieu à la même adresse que ce lieu référencé
* Alors aucun lieu n'a été créé
* Et ce médiateur exerce dans ce lieu référencé

## Règle: Seul un médiateur ajoute des lieux

### Scénario: Sans médiateur, l'ajout est refusé

* Étant donné un médiateur rattaché à deux lieux d'activité
* Quand quelqu'un sans médiateur tente d'ajouter un lieu
* Alors l'ajout est refusé

### Scénario: Un panier vide n'est pas une demande

* Étant donné un médiateur rattaché à deux lieux d'activité
* Quand ce médiateur valide un panier vide
* Alors l'ajout est refusé

## Règle: Ce qui est matérialisé dans la coop s'inscrit au registre de l'Entrepôt

> Matérialiser un lieu, c'est le poser des deux côtés dans la même transaction.
> Rien de tel quand la sonde a corrélé : on rejoint une fiche que la coop
> connaissait déjà, et le registre n'a rien de nouveau à apprendre.

### Scénario: Un lieu saisi que personne ne connaît est inscrit au registre

* Étant donné un médiateur rattaché à deux lieux d'activité
* Quand ce médiateur ajoute un lieu saisi « Tiers-lieu du Port »
* Alors le lieu « Tiers-lieu du Port » existe
* Et le lieu saisi est inscrit au registre

### Scénario: Un lieu venu de la cartographie adopte l'inscription d'où il sort

> Il porte son identifiant de cartographie dès sa création, et le registre a
> forcément déjà la ligne d'où il vient — cet identifiant y est UNIQUE. Inscrire
> sans regarder violerait la contrainte, en plein enregistrement du médiateur.

* Étant donné un médiateur rattaché à deux lieux d'activité
* Et le registre connaît déjà un lieu de la cartographie
* Quand ce médiateur ajoute ce lieu de la cartographie
* Alors le registre ne porte qu'une inscription sous cet identifiant
* Et cette inscription porte le lien vers le lieu matérialisé

### Scénario: Un lieu que le registre relie déjà à la coop est rejoint, pas recréé

> « Quel lieu coop porte cet identifiant ? » se demande au registre, où il est
> unique — et non à la copie que la coop en tenait, qui ne l'était pas et qu'il
> fallait départager par ancienneté.

* Étant donné un médiateur rattaché à deux lieux d'activité
* Et un lieu référencé dans la coop
* Et le registre relie ce lieu référencé à un identifiant de cartographie
* Quand ce médiateur ajoute le lieu de la cartographie ainsi relié
* Alors ce médiateur exerce dans ce lieu référencé

## Règle: Un nouveau lieu (nom + adresse géocodée) est matérialisé

### Scénario: Renseigner un nouveau lieu le crée et le rattache

* Étant donné je suis un médiateur
* Quand je renseigne un nouveau lieu nommé "Maison France Services"
* Alors un lieu d’activité nommé "Maison France Services" est créé et rattaché

## Règle: L’id interne prime sur l’id de cartographie nationale

L’id de cartographie nationale n’est pas posé à la création d’un lieu : c’est la
cartographie qui, après agrégation des sources, normalisation et déduplication,
l’attribue au lieu publié. Son absence ne dit donc rien de l’existence du lieu,
et sa présence ne prime jamais sur l’id interne — seule identité certaine d’un
lieu de la coop.

> Le scénario qui vérifiait qu’un doublon de même id carto ne détourne pas le
> rattachement a été retiré : sa prémisse n’existe plus. L’identité
> cartographique vit dans l’inscription au registre de l’Entrepôt, où elle est
> unique — deux lieux de la coop ne peuvent plus la partager. Ce qu’un scénario
> surveillait, une contrainte l’interdit.

### Scénario: Un lieu de la carto introuvable dans l’Entrepôt est matérialisé depuis son adresse

* Étant donné je suis un médiateur
* Quand je renseigne un lieu de la cartographie nationale introuvable dans l’Entrepôt, nommé "Tiers-lieu du Marais"
* Alors un lieu d’activité nommé "Tiers-lieu du Marais" est créé et rattaché

## Règle: Un lieu déjà présent dans la coop n’est jamais recréé

Un lieu venu de la cartographie nationale ou de l’annuaire des entreprises ne
porte pas l’id du lieu coop qui lui correspond, et l’id de cartographie
nationale ne peut pas jouer ce rôle : le lieu créé dans la coop puis publié ne
le porte pas encore. On corrèle donc sur ce qui désigne un ENDROIT — sa
dénomination, à la même adresse, dans la même commune.

### Scénario: Un lieu de la carto que la coop connaît déjà est rattaché, pas recréé

* Étant donné je suis un médiateur
* Et un lieu d’activité est disponible
* Quand je renseigne ce lieu par son entrée de cartographie nationale
* Alors ce lieu est un de mes lieux d’activité actifs
* Et aucun autre lieu d’activité n’a été créé

### Scénario: Un lieu de l’annuaire des entreprises que la coop connaît déjà est rattaché, pas recréé

* Étant donné je suis un médiateur
* Et un lieu d’activité est disponible, identifié par son SIRET
* Quand je renseigne un lieu de l’annuaire des entreprises à la même adresse
* Alors ce lieu est un de mes lieux d’activité actifs
* Et aucun autre lieu d’activité n’a été créé

### Scénario: Le même nouveau lieu renseigné deux fois n’est créé qu’une fois

* Étant donné je suis un médiateur
* Quand je renseigne deux fois le nouveau lieu nommé "Maison France Services"
* Alors un seul lieu d’activité nommé "Maison France Services" est créé et rattaché

## Règle: Un lieu supprimé que le médiateur désigne est relevé

> Le médiateur désigne le lieu par son id interne : il existe, seulement il
> n’est plus actif. Le refuser comme introuvable laissait le médiateur sans lieu,
> et le recréer en aurait fait un doublon. Le lieu est relevé, invisible de la
> cartographie comme tout lieu relevé, et le médiateur y est rattaché.

### Scénario: Désigner un lieu supprimé le relève et y rattache le médiateur

* Étant donné je suis un médiateur
* Et un lieu d’activité identique a été retiré de la cartographie par la modération
* Quand je renseigne ce lieu retiré en le désignant
* Alors le lieu retiré est relevé et je l’ai rejoint
* Et je n’ai qu’un seul lieu d’activité actif

## Règle: Le SIRET ne dit pas où l’on se trouve

Un SIRET identifie une entité juridique, pas un endroit. Une association dont le
siège est à Paris déclare légitimement ce SIRET pour son antenne de Nantes, et
deux structures distinctes partagent l’adresse d’un même tiers-lieu. Son égalité
ne prouve donc pas qu’il s’agit du même lieu, et sa divergence ne prouve pas
qu’il s’agit de deux lieux — quelle que soit la provenance de la valeur : un
SIRET exact, issu de l’API entreprise, reste muet sur l’endroit.

Le SIRET n’entre donc dans aucun rapprochement de lieux. Il reste stocké sur le
lieu, pour ce qu’il est : le renseignement d’une entité juridique.

### Scénario: Un SIRET différent ne sépare pas deux lieux à la même adresse

* Étant donné je suis un médiateur
* Et un lieu d’activité est disponible, identifié par son SIRET
* Quand je renseigne un lieu de l’annuaire des entreprises de même nom et même adresse, mais d’un autre SIRET
* Alors ce lieu est un de mes lieux d’activité actifs
* Et aucun autre lieu d’activité n’a été créé

## Règle: Un SIRET soumis par le navigateur n’est pas réputé vérifié

Le SIRET vient de l’annuaire des entreprises, mais il a transité par le
navigateur : le serveur ne peut pas distinguer celui que l’annuaire a rendu de
celui qu’on lui souffle. Il est donc stocké non vérifié — le job de
normalisation lui donnera sa valeur de preuve. L’horodater le dirait vérifié, et
dispenserait précisément ce job de le vérifier.

### Scénario: Le SIRET d’un lieu créé depuis l’annuaire reste à vérifier

* Étant donné je suis un médiateur
* Quand je renseigne un lieu de l’annuaire des entreprises portant un SIRET
* Alors le lieu créé porte ce SIRET, non vérifié
* Et le lieu créé porte l’identifiant BAN de son adresse

## Règle: Se rattacher à un lieu décrit le crée ou le rejoint

Un lieu peut n’être connu que par sa description — une dénomination et une
adresse reconnue par la Base Adresse Nationale —, comme une structure employeuse
déclarée lieu d’activité. Le lieu se reconnaît par la sonde de corrélation de la
feature : il est rejoint s’il existe, et partagé par ceux qui s’y rattachent.

### Scénario: Un lieu décrit que la coop ignore est créé et rattaché

* Étant donné je suis un médiateur
* Quand je me rattache au lieu décrit
* Alors je suis rattaché au lieu décrit

### Scénario: Se rattacher deux fois au même lieu décrit ne crée qu’un lieu

* Étant donné je suis un médiateur
* Et je me suis déjà rattaché au lieu décrit
* Quand je me rattache au lieu décrit
* Alors le lieu décrit n’existe qu’une fois et je n’y suis rattaché qu’une fois

### Scénario: Deux médiateurs rattachés au même lieu décrit le partagent

* Étant donné je suis un médiateur
* Et un collègue médiateur
* Quand je me rattache au lieu décrit
* Et mon collègue se rattache au même lieu décrit
* Alors nous sommes rattachés au même lieu

### Scénario: Un lieu décrit que la coop connaît sous une autre dénomination est rejoint

* Étant donné je suis un médiateur
* Et la coop connaît sous le nom de la commune un lieu décrit comme sa mairie
* Quand je me rattache au lieu décrit comme la mairie
* Alors je suis rattaché au lieu que la coop connaissait déjà
* Et ce lieu n’a pas été recréé

## Règle: Se détacher d’un lieu décrit clôt le rattachement

### Scénario: Se détacher d’un lieu décrit clôt le rattachement

* Étant donné je suis un médiateur
* Et je me suis déjà rattaché au lieu décrit
* Quand je me détache du lieu décrit
* Alors je ne suis plus rattaché au lieu décrit

## Règle: Le lieu décrit matérialisé s’inscrit au registre de l’Entrepôt

Matérialiser un lieu décrit, c’est poser la fiche des deux côtés dans la même
transaction. Sans quoi ce lieu n’existerait pour le registre national qu’à sa
première modification. Rien n’est inscrit quand la sonde a corrélé : on rejoint
alors une fiche que la coop connaissait déjà.

### Scénario: Le lieu décrit matérialisé paraît au registre

* Étant donné je suis un médiateur
* Quand je me rattache au lieu décrit
* Alors le lieu décrit est inscrit au registre
