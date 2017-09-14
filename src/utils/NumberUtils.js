

export function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

export function isInt(value) {
    if (isNaN(value)) {
        return false;
    }
    var x = parseFloat(value);
    return (x | 0) === x;
}
