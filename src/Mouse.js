class Mouse {
    element = null;

    //Находится ли мышь над нашим элеметом
    under = false;
    pUnder = false;

    //координаты мыши
    x = null;
    y = null;

    //положение мыши в предыдущем тике
    pX = null;
    pY = null;

    //прожата ли левая кнопка мыши (прожата ли была в предыдущий тик)
    left = false;
    pLeft = false;

    //прокрутка колёсика (вверх * / вниз -)
    delta = 0;
    pDelta = 0;

    constructor(element) {
        this.element = element;

        const update = (e) => {
            this.x = e.clientX;
            this.y = e.clientY;
            this.delta = 0;
            this.under = true;
        }

        //событие движения курсора
        element.addEventListener('mousemove', (e) => {
            this.tick();
            update(e);
        });     

        //курсор преодолевает границу и заходит на элемент
        element.addEventListener('mouseenter', (e) => {
            this.tick();
            update(e);
        });

        //курсор покидает элемент
        element.addEventListener('mouseleave', (e) => {
            this.tick();
            update(e);

            this.under = false;
        }); 

        //какая-то клавиша мыши нажата
        element.addEventListener('mousedown', (e) => {
            this.tick();
            update(e);            

            if (e.button === 0) {
                this.left = true;
            }
        }); 

        //какая-то клавиша мыши отпущена
        element.addEventListener('mouseup', (e) => {
            this.tick();
            update(e);

            if (e.button === 0) {
                this.left = false;
            }
        }); 

        //событие колёсика
        element.addEventListener('wheel', (e) => {
            this.tick();
            update(e);
            
            this.delta = e.deltaY > 0 ? 1 : -1;
        }); 
    }

    //переносим текущее состояние в предыдущее
    tick () { 
        this.pX = this.x;
        this.pY = this.y;
        this.pUnder = this.under;
        this.pLeft = this.left;
        this.pDelta = this.delta;
        this.delta = 0;
    }
}