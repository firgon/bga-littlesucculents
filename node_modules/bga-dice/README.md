# Links
[Documentation](https://thoun.github.io/bga-dice/docs/index.html)

[Demo](https://thoun.github.io/bga-dice/demo/index.html)

# Concept
## DiceManager, Stocks and Dice
The DiceManager will handle the creation of all dice used in all stocks linked to it.
Every die type used is described in the DiceManager.

For example, if you have dice in 3 stocks on your game, you will create 1 manager and 3 stocks.

# Integration
## On standard BGA project
Copy bga-dice.css and bga-dice.js files to the `modules` directory.  
Then you can include the module on your game :

CSS file: 
```css
@import url(modules/bga-dice.css);
```
JS file:
```js
define([
   "dojo","dojo/_base/declare",
   "dojo/debounce",
   "ebg/core/gamegui",
   /*...,*/
   g_gamethemeurl + "modules/bga-dice.js",
],
function (dojo, declare, debounce, gamegui, /*...,*/ bgaDice) {
```

See [examples](./EXAMPLES.md) to see how to create a stock.