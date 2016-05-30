export const uint8 = new Array(256);
export const perName = {};
export const perIdentifier = {
    S: 'severity',
    C: 'code',
    M: 'message',
    D: 'detail',
    H: 'hint',
    P: 'position',
    p: 'internalPosition',
    q: 'internalQuery',
    W: 'where',
    s: 'schemaName',
    t: 'tableName',
    c: 'columnName',
    d: 'dataTypeName',
    n: 'constraintName',
    F: 'file',
    L: 'line',
    R: 'routine',
};

for (let key in perIdentifier) {
    const value = perIdentifier[key];
    perName[value] = key;
    uint8[key.charCodeAt(0)] = value;
}
