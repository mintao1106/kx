//格子中动物的类型
export const CELL_TYPE = {
    EMPTY : 0,
    A : 1,
    B : 2,
    C : 3,
    D : 4,
    E : 5,
    F : 6,
    BIRD : 7
}
export const CELL_BASENUM = 6;//五种动物和大鸟

//网格的状态
export const CELL_STATUS = {
    COMMON: 0 ,
    CLICK: "click",//点击
    LINE: "line",//横向
    COLUMN: "column",//纵向
    WRAP: "wrap",
    BIRD: "bird"
} 

export const GRID_WIDTH = 9;//一行有9个网格
export const GRID_HEIGHT = 9;//一列有9个网格

export const CELL_WIDTH = 70;//每个网格的宽度为70
export const CELL_HEIGHT = 70;//每个网格的高度为70

export const GRID_PIXEL_WIDTH = GRID_WIDTH * CELL_WIDTH;//版面像素宽度
export const GRID_PIXEL_HEIGHT = GRID_HEIGHT * CELL_HEIGHT;//版面像素高度


// 时间表  animation time
export const ANITIME = {
    TOUCH_MOVE: 0.3,//鼠标点击移动延迟
    DIE: 0.2,//消除延迟
    DOWN: 0.5,//下落延迟
    BOMB_DELAY: 0.3,//爆炸延迟
    BOMB_BIRD_DELAY: 0.7,//大鸟的爆炸延迟
    DIE_SHAKE: 0.4 // 死前抖动延迟
}

