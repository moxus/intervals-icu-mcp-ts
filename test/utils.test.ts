import { describe, it, expect } from 'vitest';
import { removeNulls } from '../src/utils';

describe('removeNulls', () => {
    it('should remove null properties from an object', () => {
        const input = { a: 1, b: null, c: 'test' };
        const output = removeNulls(input);
        expect(output).toEqual({ a: 1, c: 'test' });
        expect(JSON.stringify(output)).toBe('{"a":1,"c":"test"}');
    });

    it('should handle nested objects', () => {
        const input = {
            a: 1,
            nested: {
                x: null,
                y: 2
            }
        };
        const output = removeNulls(input);
        expect(output).toEqual({ a: 1, nested: { y: 2 } });
    });

    it('should handle arrays', () => {
        // Note: removeNulls returns undefined for null.
        // In an array, [undefined] is stringified as [null] by JSON.stringify.
        // The object inside the array should be cleaned.
        const input = [
            null,
            { a: null, b: 1 }
        ];
        const output = removeNulls(input);
        // output[0] is undefined
        expect(output[0]).toBeUndefined();
        expect(output[1]).toEqual({ b: 1 });

        const json = JSON.stringify(output);
        // JSON.stringify([undefined, {b:1}]) -> "[null,{"b":1}]"
        expect(json).toBe('[null,{"b":1}]');
    });

    it('should preserve Dates', () => {
        const d = new Date('2023-01-01');
        const input = { date: d, val: null };
        const output = removeNulls(input);
        expect(output).toEqual({ date: d });
        expect(output.date).toBeInstanceOf(Date);
    });

    it('should return undefined for top-level null', () => {
        expect(removeNulls(null)).toBeUndefined();
    });

    it('should return primitive for top-level primitive', () => {
        expect(removeNulls(123)).toBe(123);
        expect(removeNulls('abc')).toBe('abc');
        expect(removeNulls(true)).toBe(true);
    });

    it('should handle deep nesting', () => {
         const input = {
            level1: {
                level2: {
                    level3: null,
                    keep: 'yes'
                },
                gone: null
            }
         };
         const output = removeNulls(input);
         expect(output).toEqual({
             level1: {
                 level2: {
                     keep: 'yes'
                 }
             }
         });
    });
});
