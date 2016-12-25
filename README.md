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

Additionally, a module can be ignored from the modules list, even if it is named using the
`@providesModule` syntax. You can use the `@ignoreModule` property and the module will not
be added to the modules map. Example:

```js
/**
 * @providesModule MyCustomModule
 * @ignoreModule
 */
```

Now for actually using the `haste-mapper` to generate the modules list you want, the
following prototype must be introduced:

```js
type ModuleScannerInitDataType = {
    /**
     * Root directory to scan files in.
     */
    root: string|string[],

    /**
     * Paths to additional files to be scanned and added
     * to the modules map.
     */
    files: string[],
};
type ModulesList = Map<string, Module>;

scanModules(data: ModuleScannerInitDataType): Promise<ModulesList>;
```

You will have to use it as follows:

```js
const haste = require('haste-mapper');

haste.scanModules({ root: '/something' }).then(modulesList => {
    console.log(modulesList);
});
```

Or, if you want to also scan specific files:

```js
const haste = require('haste-mapper');

haste.scanModules({
    root: '/some-root',
    files: [
        path.resolve('./myFile.js'),
        path.resolve('./myOtherFile.js'),
    ],
}).then(modulesList => {
    console.log(modulesList);
});
```

**Note:** Passing the `root` key is currently required. This will not be necessary in a future
release. Passing **either** `root` or `files` will be required then.

## API

### Type `ModuleScannerInitDataType`

Data type used for `scanModules` function, defined as:

```js
type ModuleScannerInitDataType = {
    rootDir: string|string[],
    files: string[],
};
```

### Type `ModulesList`

Return type of `scanModules`, defined as as a `Map` of `string`-keyed
`Module`s.

### Method `scanModules(data: ModuleScannerInitDataType): Promise<ModulesList>`

Recursively scans the files and directories given in the `data` object,
looking for correct docblock modules definitions. When a module is found,
it is added to the returned modules map.

### Class `Module`

Module data encapsulation type. It provides methods for getting information
about a given module.

#### Method `Module#srcPath()`

Returns the source file address of the module as a `string`.

#### Method `Module#moduleName()`

Returns the module name as documented in the module definition of the file.

#### Method `Module#isIgnored()`

Checks if the module should be ignored. A module is ignored if the property
`ignoreModule` is found in the module definition block. If a module is ignored
it should not be taken into account by the associated `babel-plugin-haste-require`.
