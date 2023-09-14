module.exports = class Ship {
    size = null;        // размер корабля
    direction = null;   // направление корабля
    killed = false;     // корабль убит или не убит

    x = null;
    y = null;

    get placed() {      // размещён корабль на игровом поле или нет
        return this.x !== null && this.y !== null;
    }

    constructor (size, direction) {
        this.size = size;
        this.direction = direction;
    }
}