//возвращает рандомное число в рамках минимального и максимального
function getRandomBetween(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

//возвращает случайный элемент среди всех переданных аргументов в функцию
function getRandomFrom(...args) {
    const index = Math.floor(Math.random() * args.length);
    return args[index];
}

// возвращает true или false если точка point находится над элементом element 
function isUnderPoint (point, element) {
    const { left, top, width, height } = element.getBoundingClientRect();
    const { x, y} = point;
    
    return left <= x && x <= left + width && top <= y && y <= top + height;
    
}

function addListeners(element, ...args) {
    element.addEventListener(...args);
    return () => element.removeEventListener(...args);
}

function geRandomtSeveral (array = [], size = 1) {
    array = array.slice();
    if (size > array.length) {
        size = array.length;
    }

    const result = [];  

    while (result.length < size) {
        const index = Math.floor(Math.random() * array.length);
        const item = array.splice(index, 1)[0];
        result.push(item);
    }

      return result;
}
 
