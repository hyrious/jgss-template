# JGSS Template

Maybe a comfortable way to write <abbr title="JavaScript Game Scripting System">JGSS</abbr> scripts.

## TL;DR

1. Add scripts in the `lib/` folder.

2. To import dependencies, add comments on the top of the file:

   ```js
   /// import base      <- tell the bundler to sort base.js on top of this file
   /// import foo, bar  <- can import multiple files, left comes first
   /// import foo/bar   <- can import nested files, '/' can be replaced with '.'
   /// import foo.bar      so this is the same as the above one
   ```

   Without these comments, the bundle script `rollup.js` will discover the
   file order of how top-level variables are **used** in other files.
   It does a regex test `^\s*{const,let,class}\s+(\w+)` on each file to do that.

3. Run `node tool/rollup.js` to bundle **all** JavaScript files in `lib/` to `bundle.js`.

4. Put this file to the game's `js/plugins/` folder.

   For convenience, run `node tool/rollup.js -o ../Project1/js/plugins/MyAwesomePlugin.js`
   to execute `3` and `4` together.

## The Problem

JGSS' script system is not modular like a normal JavaScript project.
It uses bare script tags to load core and plugin scripts.
In fact, even the loading order is specified by game developers with the
<q>Plugin Manager</q> GUI. This is not a good practice when skilled developers
writing a huge system as a plugin.

## My Solution

A typical RPG Maker MV/MZ project has this folder structure:

```
js/
├── plugins.js
└── plugins/
    └── MyAwesomePlugin.js
```

So let's start from here &mdash; add toolings to _**generate**_ the
`MyAwesomePlugin.js` file. Some choices:

1. Add a modular system and bundle the entry of the plugin, via `esbuild` or `rollup`.
2. Add a folder of scripts and concat them into the final file, like what JGSS already did.

The first choice has a problem that the imported modules may not actually exist.
The bundle script will be a bit tricky on handling these statements.
Besides, having lots of import statements on top of the file is also a bit waste
of screen. I am missing `require "./lib"`.

```js
// Bundler: just ignore this import!
const { Sprite } = require("pixi.js");
```

So I will go with the second one.

The rest burden of developing JGSS scripts is that it doesn't do HMR.
Any time we edit the scripts, we have to re-launch the game to see it take effect.
Actually we have another tricky way to do that &mdash;

1. The script can register disposers that should be called on dispose this section of code.

2. Save the overriden methods so that we do not override them again.

   ```js
   // '$' is a special object that will be replaced with the HMR runtime.
   $.Game_Actor_gainHp = Game_Actor.prototype.gainHp
   Game_Actor.prototype.gainHp = function(value) {
     $.Game_Actor_gainHp.call(this, value)
     console.log('gainHp!', value)
   }
   $.dispose = () => {
     // Restore the old method.
     Game_Actor.prototype.gainHp = $.Game_Actor_gainHp
   }
   ```

   Obviously it doesn't solve the whole problem. But it should just work.

## License

CC0 @ [hyrious](https://github.com/hyrious)
