# Fonctionnalité: Lister les lieux d'un département

> L'annuaire d'un territoire : ce qu'un médiateur voit des lieux qui l'entourent,
> et non l'inventaire complet de la base.

## Règle: Un lieu ni publié ni fréquenté n'est l'annuaire de personne

> Deux raisons de figurer à l'annuaire, et il suffit d'une : le lieu est publié
> sur la cartographie nationale, ou bien quelqu'un y exerce encore. Un lieu que
> personne ne fréquente et que rien ne publie n'apparaît nulle part.

### Scénario: Un lieu publié figure à l'annuaire

* Étant donné trois lieux dans le même département
* Quand on liste les lieux de ce département
* Alors le lieu publié est proposé

### Scénario: Un lieu où un médiateur exerce figure à l'annuaire

* Étant donné trois lieux dans le même département
* Quand on liste les lieux de ce département
* Alors le lieu fréquenté est proposé

### Scénario: Un lieu ni publié ni fréquenté ne figure pas à l'annuaire

* Étant donné trois lieux dans le même département
* Quand on liste les lieux de ce département
* Alors le lieu délaissé n’est pas proposé

### Scénario: Un lieu supprimé ne figure plus à l'annuaire

* Étant donné trois lieux dans le même département
* Et le lieu publié est supprimé
* Quand on liste les lieux de ce département
* Alors le lieu publié n’est pas proposé

## Règle: Un lieu sans adresse reconnue reste à l'annuaire, pour qu'on la lui donne

> L'annuaire mène à la fiche, seul endroit où l'on corrige une adresse : le lieu
> y figure, signalé.

### Scénario: Un lieu sans adresse reconnue par la BAN est signalé à préciser

* Étant donné trois lieux dans le même département
* Et le lieu fréquenté n'a pas d'adresse reconnue par la BAN
* Quand on liste les lieux de ce département
* Alors le lieu fréquenté est proposé
* Et seul le lieu fréquenté est signalé avec une adresse à préciser

## Règle: L'annuaire s'arrête aux frontières du département

> Le code INSEE porte le département, y compris outre-mer et en Corse, où il ne
> tient pas sur deux caractères.

### Scénario: Un lieu d’un autre département n’est pas proposé

* Étant donné trois lieux dans le même département
* Et un quatrième lieu publié dans un autre département
* Quand on liste les lieux de ce département
* Alors le lieu d’ailleurs n’est pas proposé

## Règle: L'annuaire se filtre par commune

### Scénario: Seuls les lieux de la commune choisie sont proposés

* Étant donné trois lieux dans le même département
* Et un quatrième lieu publié dans une autre commune du département
* Quand on liste les lieux de ce département dans la commune des trois premiers
* Alors le lieu publié est proposé
* Et le lieu de l’autre commune n’est pas proposé

## Règle: Le nombre de lieux d'un département est celui de son annuaire

> Le réseau du département annonce un nombre de lieux : c'est le nombre de lieux
> que son annuaire propose, ni plus ni moins.

### Scénario: Le nombre de lieux compte les lieux que l'annuaire propose

* Étant donné trois lieux dans le même département
* Quand on compte les lieux de ce département
* Alors le nombre de lieux est celui de l’annuaire du département
