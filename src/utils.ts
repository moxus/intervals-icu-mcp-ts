
/**
 * Recursively removes null values from an object or array.
 * - null -> undefined (so JSON.stringify removes the key from objects)
 * - Objects -> recursively processed
 * - Arrays -> recursively processed (elements becoming undefined appear as null in JSON)
 * - Primitives / Dates -> preserved
 */
export function removeNulls(obj: any): any {
    if (obj === null) {
        return undefined;
    }

    if (typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(v => removeNulls(v));
    }

    const newObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const val = removeNulls(obj[key]);
            if (val !== undefined) {
                newObj[key] = val;
            }
        }
    }
    return newObj;
}
