module.exports = class Battlefield {
    ships = [];      // корабли
    shots = [];     // выстрелы
    
    _privat_matrix = null; //текущая версия matrix
    _privat_changed = true; // флаг, если true - что-то изменилось (добавили/убрали корабль/выстрел)

    get luser () { // конец игры
        for (const ship of this.ships) { //проверяем все корабли, и если есть хоть один целый корабль, то игра ещё не закончилась
            if (!ship.killed) {
                return false;
            }
        }

        return true; //если живых кораблей нет, то игра закончена и на этом поле проигравший
    }
   
    get matrix() {  // матрица игрового поля, где информаиця по выстрелам и убийства
        if (!this._privat_changed) {
            return this._privat_matrix;
        }

        const matrix = [];

        for (let y = 0; y < 10; y++) {
            const row = [];

            for (let x = 0; x < 10; x++) {
                const item = {
                    x,
                    y,
                    ship: null,
                    free: true,
                    shoted: false, // выстрелена ли эта ячейка
                    wounded: false, // ранен ли корабль
                };

                row.push(item);
            }

            matrix.push(row);
        }        

        for (const ship of this.ships) {

            // если корабль не находится на поле - идём на следующую иттерацию
            if (!ship.placed) {
                continue;
            }            

            const { x, y } = ship;
            const dx = ship.direction === "row";
            const dy = ship.direction === "column";            

            for (let i = 0; i < ship.size; i++) {
                const cx = x + dx * i;
                const cy = y + dy * i;
                
                const item = matrix[cy][cx];
                item.ship = ship;
            }

            for (let y = ship.y - 1; y < ship.y + ship.size * dy + dx + 1; y++) {
                for (let x = ship.x - 1; x < ship.x + ship.size * dx + dy + 1; x++) {
                    if (this.inField(x, y)) {
                        const item = matrix[y][x];
                        item.free = false;                                              
                    }
                }
            }
        }

        for (const { x, y } of this.shots) { // проходим по выстрелам
            const item = matrix[y][x];
            item.shoted = true;

            if (item.ship) { // если в ячейке выстрела есть корабль, то корабль считается раненным
                item.wounded = true;
            }
        }

        this._privat_matrix = matrix;
        this._privat_changed = false;

        return this._privat_matrix;
        
    }

    get complete () {
        // если кораблей не 10 - вернуть false;
        if (this.ships.length !== 10) {
            return false;
        } 

        // если корабль не размещён на игровом поле - вернуть false
        for (const ship of this.ships) {
            if (!ship.placed) {
                return false;
            }
        }

        return true;
    }

    // лежат ли х и у в пределах игрового поля
    inField(x, y) {
        // функция, которая проверяет, является ли аргумент целым числом
        const isNumber = (n) => 
            parseInt(n) === n && !isNaN(n) && ![Infinity, -Infinity].includes(n);
        
        // проверяем, являются ли эти координаты числами или нет
        if (!isNumber(x) || !isNumber(y)) {
            return false;
        }        

        return 0 <= x && x < 10 && 0 <= y && y < 10;
    }

    // добавить корабль
    addShip(ship, x, y) {
        // если корабль уже существует в масасиве ships - то вернуть false 
        if (this.ships.includes(ship)) {
            return false;
        }

        this.ships.push(ship);

        if (this.inField(x, y)) {
            
            const dx = ship.direction === "row";
            const dy = ship.direction === "column";  
            
            let placed = true;

            for (let i = 0; i < ship.size; i++) {
                const cx = x + dx * i;
                const cy = y + dy * i;                

                // проверка, выходит ли корабль за рамки игрового поля
                if (!this.inField(cx, cy)) {                    
                    placed = false;
                    break;
                }                
                
                // проверка, свободны ли ячейки, где брошен корабль
                const item = this.matrix[cy][cx];
                
                if (!item.free) {
                    placed = false;
                    break;
                }                
            }

            if (placed) {
                Object.assign(ship, { x, y });
            }

        }

        this._privat_changed = true;
        return true;
    }

    // удалить корабль
    removeShip(ship) {
        // если корабль не существует в масасиве ships - то вернуть false 
        if (!this.ships.includes(ship)) {
            return false;
        }

        const index = this.ships.indexOf(ship);
        this.ships.splice(index, 1);

        ship.x = null;
        ship.y = null;

        this._privat_changed = true;
        return true;
    }

    // удалить все корабли
    removeAllShips() {
        const ships = this.ships.slice();
        
        for (const ship of ships) {
            this.removeShip(ship);
        }

        return ships.length;
    }
 

    // добавить выстрел
    addShot(shot) {
        // если координаты у имеющегося выстрела и нового совпадают - его добавлять не будем / блокируется выстрел в одну и ту же клетку
        for (const { x, y } of this.shots) {
           if (x === shot.x && y === shot.y) {
                return false;
           }     
        }

        this.shots.push(shot);          
        this._privat_changed = true;

        const matrix = this.matrix;
        const { x, y } = shot;
        
        if (matrix[y][x].ship) { // есть ли в выстреленной ячейке корабль
            shot.setVariant('wounded'); // если есть, ставим "ранен"

            const { ship } = matrix[y][x];
            const dx = ship.direction === "row";
            const dy = ship.direction === "column";  

            let killed = true; //флаг, предполагающий убит ли корабль: true - убит, false - не убит

            for (let i = 0; i < ship.size; i++) { // перебираем корабли и проверяем, есть ли не раненные палубы, если есть - то корабль не убит
                const cx = ship.x + dx * i;
                const cy = ship.y + dy * i;  
                const item = matrix[cy][cx];           
                
                if (!item.wounded) {
                    killed = false;
                    break;
                }
            }

            if (killed) { // если все палубы ранены, то корабль считается убитым
                ship.killed = true;

                for (let i = 0; i < ship.size; i++) { // перебираем корабли и проверяем, есть ли не раненные палубы, если есть - то корабль не убит
                    const cx = ship.x + dx * i;
                    const cy = ship.y + dy * i;  
                    const item = matrix[cy][cx];
    
                    const shot = this.shots.find(
                        (shot) => shot.x === cx && shot.y === cy
                    );

                    shot.setVariant('killed');

                }                
            }
        }           

        this._privat_changed = true;
        return true;
    }

    

    // удалить выстрел
    removeShot(shot) {
        if (!this.shots.includes(shot)) {
            return false;
        }

        const index = this.shots.indexOf(shot);
        this.shots.splice(index, 1);

        this._privat_changed = true;
        return true;
    }

    // удалит все выстрелы
    removeAllShots() {
        const shots = this.shots.slice();
        
        for (const shot of shots) {
            this.removeShot(shot);
        }

        return shots.length;
    }

    randomize(ShipClass = Ship) {
        this.removeAllShips();

        for (let size = 4; size >= 1; size--) {
            for (let n = 0; n < 5 - size; n++) {
                const direction = getRandomFrom('row', 'column');
                const ship = new ShipClass(size, direction);

                while(!ship.placed) {
                    const x = getRandomBetween(0, 9);
                    const y = getRandomBetween(0, 9);

                    this.removeShip(ship);
                    this.addShip(ship, x, y);
                }
            }
        }
    }

    clear () {
        this.removeAllShips();
        this.removeAllShots();
    }
}