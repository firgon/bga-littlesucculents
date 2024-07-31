# Code example
## Example of integration

```js
define([
   "dojo","dojo/_base/declare",
   "dojo/debounce",
   "ebg/core/gamegui",
   /*...,*/
   g_gamethemeurl + "modules/bga-dice.js",
],
function (dojo, declare, debounce, gamegui, /*...,*/ bgaDice) {
   return declare("bgagame.mygame", gamegui, {
      constructor: function() {

        // create the card manager
        this.diceManager = new (this, {
            dieTypes: {
                'white': new BgaDie6(),
                'black': new BgaDie6(),
            },
        });

        // create the stock
        this.stock = new LineStock(this.diceManager, document.getElementById('dice-stock'));

        this.stock.addDice([
            { id: getDieId(), type: 'white', face: 2, location: 'table', location_arg: 0 },
            { id: getDieId(), type: 'black', face: 5, location: 'table', location_arg: 0 },
        ]);
```

## Example of rolling dice
```js
    const dice = lineStock.getDice();
    dice.forEach(die => die.value = Math.floor(Math.random() * 6) + 1); // set the new face of each dice
    lineStock.rollDice(dice, {
        effect: 'rollIn',
        duration: [800, 1200] // random duration between 800ms and 1200ms
    });
```
