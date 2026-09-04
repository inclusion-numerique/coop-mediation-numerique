# Feature: Lister les lieux d'un département

> L'annuaire d'un territoire : ce qu'un médiateur voit des lieux qui l'entourent,
> et non l'inventaire complet de la base.

## Rule: Un lieu ni publié ni fréquenté n'est l'annuaire de personne

> Deux raisons de figurer à l'annuaire, et il suffit d'une : le lieu est publié
> sur la cartographie nationale, ou bien quelqu'un y exerce encore. Un lieu que
> personne ne fréquente et que rien ne publie n'apparaît nulle part.

### Scenario: Un lieu publié figure à l'annuaire

* Given trois lieux dans le même département
* When on liste les lieux de ce département
* Then le lieu publié est proposé

### Scenario: Un lieu où un médiateur exerce figure à l'annuaire

* Given trois lieux dans le même département
* When on liste les lieux de ce département
* Then le lieu fréquenté est proposé

### Scenario: Un lieu ni publié ni fréquenté ne figure pas à l'annuaire

* Given trois lieux dans le même département
* When on liste les lieux de ce département
* Then le lieu délaissé n’est pas proposé

### Scenario: Un lieu supprimé ne figure plus à l'annuaire

* Given trois lieux dans le même département
* And le lieu publié est supprimé
* When on liste les lieux de ce département
* Then le lieu publié n’est pas proposé

## Rule: L'annuaire s'arrête aux frontières du département

> Le code INSEE porte le département, y compris outre-mer et en Corse, où il ne
> tient pas sur deux caractères.

### Scenario: Un lieu d’un autre département n’est pas proposé

* Given trois lieux dans le même département
* And un quatrième lieu publié dans un autre département
* When on liste les lieux de ce département
* Then le lieu d’ailleurs n’est pas proposé
