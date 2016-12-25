/**
 * @flow
 */

import type Module from './Module';

export default class ModulesMapUtils {
    static toPlainObject(modules: Map<string, Module>): { [moduleName: string]: string } {
        let modulesMap = {};
        modules.forEach((m: Module) => {
            if (!m.isIgnored()) {
                modulesMap[m.moduleName()] = m.srcPath();
            }
        });

        return modulesMap;
    }
}
