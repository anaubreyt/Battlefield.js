module.exports = class Shot {
    x = null;
    y = null;
    variant = null; //вариант выстрела: точка(промах) / крестик(попал) / крестик с бордюром(убили)

    constructor (x, y, variant = 'miss') {
        Object.assign(this, { x, y, variant });
    }

    setVariant (variant) {
        this.variant = variant;
    }
}