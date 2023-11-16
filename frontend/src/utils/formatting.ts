

export const capitalize = (str: string) => {
    return str.split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const getFraction = (decimal: number) => {
    const rounded = (Math.round(decimal * 10000) / 10000).toString();
    const moreRounded = Number(rounded.substring(0, rounded.lastIndexOf('0') + 2));
    switch (moreRounded) {
        case 0:
            return '0';
        case 0.1:
            return '1/10';
        case 0.2:
            return '1/5';
        case 0.3:
            return '1/3';
        case 0.4:
            return '2/5';
        case 0.5:
            return '1/2';
        case 0.6:
            return '3/5';
        case 0.7:
            return '2/3';
        case 0.8:
            return '4/5';
        case 0.9:
            return '9/10';
        case 0.01:
            return '1/100';
        case 0.02:
            return '1/50';
        case 0.03:
            return '1/33';
        case 0.04:
            return '1/25';
        case 0.05:
            return '1/20';
        case 0.06:
            return '1/16';
        case 0.07:
            return '1/14';
        case 0.08:
            return '1/12';
        case 0.09:
            return '1/11';
        case 0.001:
            return '1/1000';
        case 0.002:
            return '1/500';
        case 0.003:
            return '1/333';
        case 0.004:
            return '1/250';
        case 0.005:
            return '1/200';
        case 0.006:
            return '1/166';
        case 0.007:
            return '1/142';
        case 0.008:
            return '1/125';
        case 0.009:
            return '1/111';
        case 0.0001:
            return '1/10000';
        case 0.0002:
            return '1/5000';
        case 0.0003:
            return '1/3333';
        case 0.0004:
            return '1/2500';
        case 0.0005:
            return '1/2000';
        case 0.0006:
            return '1/1666';
        case 0.0007:
            return '1/1428';
        case 0.0008:
            return '1/1250';
        case 0.0009:
            return '1/1111';
        default:
            console.warn('Unknown fraction', moreRounded);
            return '0';
    }
};

export default capitalize;