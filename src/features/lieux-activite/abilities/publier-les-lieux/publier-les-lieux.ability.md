# Fonctionnalité: Publier les lieux sur la cartographie nationale

> Ce que la coop verse au bien commun. Trois conditions se cumulent, et
> l'absence d'une seule retire le lieu de la moisson.

## Règle: Un lieu ne se publie que s'il est déclaré visible

### Scénario: Le lieu non partagé reste hors de la cartographie

* Étant donné un lieu où exerce un médiateur visible
* Et ce lieu n'est pas partagé sur la cartographie
* Quand la cartographie nationale moissonne les lieux
* Alors ce lieu n'est pas publié

## Règle: Un lieu sans adresse reconnue par la BAN n'est pas publié

> La carte situe les lieux : un lieu que la Base Adresse Nationale ne reconnaît
> pas enverrait l'usager nulle part.

### Scénario: Le lieu partagé sans adresse reconnue reste hors de la cartographie

* Étant donné un lieu partagé où exerce un médiateur visible
* Et l'adresse de ce lieu n'est pas reconnue par la BAN
* Quand la cartographie nationale moissonne les lieux
* Alors ce lieu n'est pas publié

## Règle: Un lieu qui n'annonce aucun service n'est pas publié

> La cartographie sert à orienter : un lieu dont on ignore ce qu'il propose
> n'oriente personne, et ferait se déplacer un usager pour rien.
>
> La garde se tient à la moisson, et non à la saisie. Exiger un service avant de
> rendre le lieu visible fermait la seule porte menant aux champs qui les
> renseignent : les sections des services ne se déplient qu'une fois le lieu
> visible. Le médiateur déclare donc son intention quand il veut, la carte
> attend qu'elle soit exploitable.

### Scénario: Le lieu partagé sans service reste hors de la cartographie

* Étant donné un lieu partagé où exerce un médiateur visible
* Et ce lieu n'annonce aucun service
* Quand la cartographie nationale moissonne les lieux
* Alors ce lieu n'est pas publié

## Règle: Un lieu sans médiateur reste publié

> La règle commune aux sources de la cartographie : tout lieu est affiché, sauf
> si quelqu'un a décidé de le masquer. Qu'aucun médiateur de la coop n'y exerce
> ne dit pas que le lieu a fermé ; seule sa visibilité en décide.

### Scénario: Le lieu dont le médiateur s'est retiré reste publié

* Étant donné un lieu partagé où exerce un médiateur visible
* Et ce médiateur s'est retiré du lieu
* Quand la cartographie nationale moissonne les lieux
* Alors ce lieu est publié
* Et il n'annonce aucun aidant

### Scénario: Le lieu où aucun médiateur n'a jamais exercé est publié

* Étant donné un lieu partagé où aucun médiateur n'a jamais exercé
* Quand la cartographie nationale moissonne les lieux
* Alors ce lieu est publié
* Et il n'annonce aucun aidant

### Scénario: Le lieu dont le seul médiateur a supprimé son compte reste publié

* Étant donné un lieu partagé où exerce un médiateur visible
* Et ce médiateur a supprimé son compte
* Quand la cartographie nationale moissonne les lieux
* Alors ce lieu est publié
* Et il n'annonce aucun aidant

## Règle: Se rendre invisible retire son nom, pas le lieu

> Le réglage porte sur le PROFIL — nom, courriel, téléphone —, pas sur le lieu
> d'exercice. Une personne qui ne veut pas être nommée sur la carte n'en retire
> pas pour autant l'adresse où le public est reçu ; c'est la visibilité du lieu,
> et elle seule, qui décide de sa présence.

### Scénario: Le médiateur caché disparaît de la fiche, pas de la carte

* Étant donné un lieu partagé où exerce un médiateur visible
* Et ce médiateur a choisi de ne pas être visible
* Quand la cartographie nationale moissonne les lieux
* Alors ce lieu est publié
* Et il n'annonce aucun aidant

## Règle: Le lieu publié annonce qui y accueille

### Scénario: Le médiateur visible accompagne le lieu publié

* Étant donné un lieu partagé où exerce un médiateur visible
* Quand la cartographie nationale moissonne les lieux
* Alors ce lieu est publié
* Et il annonce un aidant

## Règle: Ce qui sort est mesuré au schéma national

> Un champ facultatif que le standard refuse se perd, et le lieu reste : il y est
> utile sans ses horaires, il n'existe plus du tout s'il est écarté.
>
> La colonne `site_web` joint pourtant plusieurs adresses par « | ». Les publier
> telles quelles ferait une seule URL qui en contient un — que le standard
> refuse, et le contact tombant d'un bloc, le téléphone et les courriels
> disparaîtraient avec elle.

### Scénario: Le lieu à plusieurs sites web garde son contact

* Étant donné un lieu partagé où exerce un médiateur visible
* Et ce lieu déclare deux sites web
* Quand la cartographie nationale moissonne les lieux
* Alors ce lieu est publié
* Et il annonce ses deux sites web

## Règle: La moisson se restreint à un dispositif

### Scénario: Le lieu du dispositif demandé est publié

* Étant donné un lieu partagé où exerce un médiateur visible
* Et ce lieu relève de France Services
* Quand la cartographie nationale moissonne les lieux du dispositif "France Services"
* Alors ce lieu est publié

### Scénario: Le lieu d'un autre dispositif n'est pas publié

* Étant donné un lieu partagé où exerce un médiateur visible
* Et ce lieu relève de France Services
* Quand la cartographie nationale moissonne les lieux du dispositif "Aidants Connect"
* Alors ce lieu n'est pas publié
