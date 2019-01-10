import { CELL_TYPE, ANITIME, CELL_STATUS, GRID_HEIGHT } from "./ConstValue";
export default function CellModel(){
    this.type = null;
    this.status = CELL_STATUS.COMMON;//初始状态设为公有
    this.x = 1;//当前横坐标为
    this.y = 1;//当前纵坐标
    this.startX = 1;//最初横坐标
    this.startY = 1;//最初纵坐标
    this.cmd = [];
    this.isDeath = false;
    this.objecCount = Math.floor(Math.random() * 1000);
}
//设置单元格中存放的类型
CellModel.prototype.init= function(type){
    this.type = type;
}

//当前单元格为空，返回为空格
CellModel.prototype.isEmpty = function(){
    return this.type == CELL_TYPE.EMPTY; 
}
//设置空格中的内容
CellModel.prototype.setEmpty = function(){
    this.type = CELL_TYPE.EMPTY;
}
//设置当前坐标
CellModel.prototype.setXY = function(x,y){
    this.x = x;
    this.y = y;
}
//设置游戏初始坐标
CellModel.prototype.setStartXY = function(x,y){
    this.startX = x;
    this.startY = y;
}
//设置当前状态
CellModel.prototype.setStatus = function(status){
    this.status = status;
}
//判断能移动和不能移动
CellModel.prototype.moveToAndBack = function(pos){
    var srcPos = cc.p(this.x,this.y);
    //能互换
    this.cmd.push({
        action: "moveTo",
        keepTime: ANITIME.TOUCH_MOVE,
        playTime: 0,
        pos: pos
    });
    //不能互换
    this.cmd.push({
        action: "moveTo",
        keepTime: ANITIME.TOUCH_MOVE,
        playTime: ANITIME.TOUCH_MOVE,
        pos: srcPos
    });
}
//能移动
CellModel.prototype.moveTo = function(pos, playTime){
    var srcPos = cc.p(this.x,this.y);
    this.cmd.push({
        action: "moveTo",
        keepTime: ANITIME.TOUCH_MOVE,
        playTime: playTime,
        pos: pos
    });
    //互换后的坐标
    this.x = pos.x;
    this.y = pos.y;
}
//动物进行消除
CellModel.prototype.toDie = function(playTime){
    this.cmd.push({
        action: "toDie",
        playTime: playTime,
        keepTime: ANITIME.DIE
    });
    this.isDeath = true;
}
//动物消除前的摇动
CellModel.prototype.toShake = function(playTime){
    this.cmd.push({
        action: "toShake",
        playTime: playTime,
        keepTime: ANITIME.DIE_SHAKE
    });
}
//设置可视区域
CellModel.prototype.setVisible = function(playTime, isVisible){
    this.cmd.push({
        action: "setVisible",
        playTime: playTime,
        keepTime: 0,
        isVisible: isVisible
    });
}

//CellModel.prototype.moveToAndDie = function(pos){}

//如果可以生成大鸟，当前格子中的类型是大鸟
CellModel.prototype.isBird = function(){
    return this.type == CELL_TYPE.G;
}
