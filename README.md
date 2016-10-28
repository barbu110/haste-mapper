# haste-mapper

Inspired from Facebook's [`node-haste`](https://github.com/facebookarchive/node-haste),
`haste-mapper` is a modules list builder.

## How it works?

It will scan all the JavaScript files in the root directory you provide, read the docblock
comment at the beginning of the file check for attributes. It will check for
`@providesModule` attribute.

## How can I use it?

All you have to do is to add a docblock comment at the beginnging of a `.js` file in your
project's root containing something like

```js
/**
 * @providesModule MyCustomModule
 */
```

and `haste-mapper` will recognize it as a named module and will add it to the modules list.
