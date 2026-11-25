# Fonctionnalité: Lister les lieux d'un médiateur pour l'inscription

> L'étape « lieux d'activité » de l'inscription s'en pré-remplit, et son
> récapitulatif les affiche. Les lieux viennent dans l'ordre où le médiateur
> s'y est rattaché.

## Règle: Seuls les lieux où le médiateur exerce aujourd'hui sont listés

### Scénario: Le lieu où le médiateur exerce est listé pour l'inscription

* Étant donné un médiateur qui exerce dans un lieu
* Quand on liste les lieux de ce médiateur pour l'inscription
* Alors les lieux listés pour l'inscription contiennent ce lieu

### Scénario: Un lieu quitté n'est pas listé pour l'inscription

* Étant donné un médiateur qui exerce dans un lieu
* Et ce médiateur a quitté ce lieu
* Quand on liste les lieux de ce médiateur pour l'inscription
* Alors aucun lieu n'est listé pour l'inscription

## Règle: Le lieu se montre tel que le registre le décrit

> Ce que le registre ne porte pas, le pivot (SIRET ou RNA), reste celui de la
> coop.

### Scénario: Le lieu listé pour l'inscription porte l'identifiant du registre

* Étant donné un médiateur qui exerce dans un lieu
* Et le registre donne à ce lieu un identifiant de cartographie
* Quand on liste les lieux de ce médiateur pour l'inscription
* Alors le lieu listé pour l'inscription porte l'identifiant du registre
