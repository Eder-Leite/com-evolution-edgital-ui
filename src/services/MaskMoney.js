export const moeda = (value) => {
    value.split('R$ ').join('');
    var v = value.replace(/\D/g, '');
    v = String(Number(v));

    var len = v.length;

    if (1 === len) {
        v = 'R$ ' + v.replace(/(\d)/, '0,0$1');
    }

    if (2 === len) {
        v = 'R$ ' + v.replace(/(\d)/, '0,$1');
    }

    if (len > 2) {
        v = 'R$ ' + v.replace(/(\d{2})$/, ',$1');
    }

    if (len > 5) {
        var x = len - 5;
        var er = new RegExp('(\\d{' + x + '})(\\d)');
        v = v.replace(er, '$1.$2');
    }
    return v;
}

export const formatMoney = (amount, decimalCount = 2, decimal = ',', thousands = '.', sign = 'R$ ') => {
    try {
        var negativeSign = '';

        if (amount.indexOf('-') !== -1) {
            negativeSign = '-';
        }

        if (amount.indexOf('+') !== -1) {
            negativeSign = '';
        }

        amount.split(sign).join('');
        amount = amount.replace(/\D/g, '');
        amount = Number(amount) / 100;

        decimalCount = Math.abs(decimalCount);
        decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;
        let v = negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
        return `${sign} ${v}`;
    } catch (e) {
        console.log(e)
    }
}

const makeMoneyFormatter = ({
    sign = 'R$ ',
    delimiter = '.',
    decimal = ',',
    append = false,
    precision = 2,
    round = true,
    custom
} = {}) => value => {

    const e = [1, 10, 100, 1000, 10000, 100000, 1000000, 10000000];

    value = round
        ? (Math.round(value * e[precision]) / e[precision])
        : parseFloat(value);

    const pieces = value
        .toFixed(precision)
        .replace('.', decimal)
        .split('');

    let ii = pieces.length - (precision ? precision + 1 : 0);

    while ((ii -= 3) > 0) {
        pieces.splice(ii, 0, delimiter)
    }

    if (typeof custom === 'function') {
        return custom({
            sign,
            float: value,
            value: pieces.join('')
        })
    }

    return append
        ? pieces.join('') + sign
        : sign + pieces.join('');
}

export const formatoBR = makeMoneyFormatter();
