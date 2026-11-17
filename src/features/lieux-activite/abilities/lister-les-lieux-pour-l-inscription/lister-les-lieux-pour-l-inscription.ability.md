# Feature: Lister les lieux d'un médiateur pour l'inscription

> L'étape « lieux d'activité » de l'inscription s'en pré-remplit, et son
> récapitulatif les affiche. Les lieux viennent dans l'ordre où le médiateur
> s'y est rattaché.

## Rule: Seuls les lieux où le médiateur exerce aujourd'hui sont listés

### Scenario: Le lieu où le médiateur exerce est listé pour l'inscription

* Given un médiateur qui exerce dans un lieu
* When on liste les lieux de ce médiateur pour l'inscription
* Then les lieux listés pour l'inscription contiennent ce lieu

### Scenario: Un lieu quitté n'est pas listé pour l'inscription

* Given un médiateur qui exerce dans un lieu
* And ce médiateur a quitté ce lieu
* When on liste les lieux de ce médiateur pour l'inscription
* Then aucun lieu n'est listé pour l'inscription

## Rule: Le lieu se montre tel que le registre le décrit

> Ce que le registre ne porte pas, le pivot (SIRET ou RNA), reste celui de la
> coop.

### Scenario: Le lieu listé pour l'inscription porte l'identifiant du registre

* Given un médiateur qui exerce dans un lieu
* And le registre donne à ce lieu un identifiant de cartographie
* When on liste les lieux de ce médiateur pour l'inscription
* Then le lieu listé pour l'inscription porte l'identifiant du registre
