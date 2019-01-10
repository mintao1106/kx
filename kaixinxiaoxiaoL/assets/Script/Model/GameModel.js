import CellModel from "./CellModel";
import { CELL_TYPE, CELL_BASENUM, CELL_STATUS, GRID_WIDTH, GRID_HEIGHT, ANITIME } from "./ConstValue";

export default function GameModel(){
    this.cells = null;
    this.cellBgs = null;
    this.lastPos = cc.p(-1, -1);//标记所点击的动物坐标
    this.cellTypeNum = 5;//格子中初始动物种类5个
    this.cellCreateType = []; // 升成种类只在这个数组里面查找
}

GameModel.prototype.init = function(cellTypeNum){
    this.cells = [];//单元格设置为一个数组
    this.setCellTypeNum(cellTypeNum || this.cellTypeNum);
    //生成所有的格子
    for(var i = 1;i<=GRID_WIDTH;i++){
        this.cells[i] = [];
        for(var j = 1;j <= GRID_HEIGHT;j++){
            this.cells[i][j] = new CellModel();
        }
    }

    for(var i = 1;i<=GRID_WIDTH;i++){
        for(var j = 1;j <= GRID_HEIGHT;j++){
            let flag = true;
            while(flag){
                flag = false;
                this.cells[i][j].init(this.getRandomCellType());//生成随机的动物
                let result = this.checkPoint(j, i)[0];
                if(result.length > 2){
                    flag = true;
                }
                this.cells[i][j].setXY(j, i);
                this.cells[i][j].setStartXY(j, i);
            }
        }
    }

}

//GameModel.prototype.initWithData = function(data){ // to do}
   
 

GameModel.prototype.checkPoint = function (x, y) {
    let checkWithDirection = function (x, y, direction) {
        let queue = [];//行列设为一个数组
        let vis = [];
        vis[x + y * 9] = true;
        queue.push(cc.p(x, y));
        let front = 0;
        while (front < queue.length) {
            //let direction = [cc.p(0, -1), cc.p(0, 1), cc.p(1, 0), cc.p(-1, 0)];
            let point = queue[front];
            let cellModel = this.cells[point.y][point.x];
            front++;
            if (!cellModel) {
                continue;
            }
            for (let i = 0; i < direction.length; i++) {
                let tmpX = point.x + direction[i].x;
                let tmpY = point.y + direction[i].y;
                if (tmpX < 1 || tmpX > 9
                    || tmpY < 1 || tmpY > 9
                    || vis[tmpX + tmpY * 9]
                    || !this.cells[tmpY][tmpX]) {
                    continue;
                }
                if (cellModel.type == this.cells[tmpY][tmpX].type) {
                    vis[tmpX + tmpY * 9] = true;
                    queue.push(cc.p(tmpX, tmpY));
                }
            }
        }
        return queue;
    }

    let rowResult = checkWithDirection.call(this,x,y,[cc.p(1, 0), cc.p(-1, 0)]);//左右移动
    let colResult = checkWithDirection.call(this,x,y,[cc.p(0, -1), cc.p(0, 1)]);//上下移动
    let result = [];
    let newCellStatus = "";//新的状态
    //如果一行有五个相同的动物，生成大鸟
    if(rowResult.length >= 5 || colResult.length >= 5){
        newCellStatus = CELL_STATUS.BIRD;
    }
    //如果一行有三个相同的的动物，消除
    else if(rowResult.length >= 3 && colResult.length >= 3){
        newCellStatus = CELL_STATUS.WRAP;
    }
    //如果横向移动，四个动物相同，生成消除一行的的这个动物
    else if(rowResult.length >= 4){
        newCellStatus = CELL_STATUS.LINE;
    }
    //如果纵向移动，四个动物相同，生成一列的这个动物
    else if(colResult.length >= 4){
        newCellStatus = CELL_STATUS.COLUMN;
    }


    if(rowResult.length >= 3){
        result = rowResult;
    }
    if(colResult.length >= 3){
        let tmp = result.concat();
        colResult.forEach(function(newEle){
            let flag = false;
            tmp.forEach(function (oldEle) {
                if(newEle.x == oldEle.x && newEle.y == oldEle.y){
                    flag = true;
                }
            }, this);
            if(!flag){
                result.push(newEle);
            }
        }, this);
    }
    return [result,newCellStatus, this.cells[y][x].type];
}


GameModel.prototype.getCells = function(){
    return this.cells;
}

// controller调用的主要入口
// 点击某个格子
GameModel.prototype.selectCell =function(pos){
    this.changeModels = [];// 发生改变的model，将作为返回值，给view播动作
    this.effectsQueue = []; // 动物消失，爆炸等特效
    var lastPos = this.lastPos;//上一次点击格子的坐标
    var delta = Math.abs(pos.x - lastPos.x) + Math.abs(pos.y - lastPos.y);//检查是否为相邻的格子
    
    //非相邻格子， 直接返回
    if(delta != 1){ 
        this.lastPos = pos;
        return [[], []];
    }
    let curClickCell = this.cells[pos.y][pos.x]; //当前点击的格子
    let lastClickCell = this.cells[lastPos.y][lastPos.x]; // 上一次点击的格式
    this.exchangeCell(lastPos, pos);
    var result1 = this.checkPoint(pos.x, pos.y)[0];
    var result2 = this.checkPoint(lastPos.x, lastPos.y)[0];
    this.curTime = 0; // 动画播放的当前时间
    this.pushToChangeModels(curClickCell);
    this.pushToChangeModels(lastClickCell);
   
    // 判断两个是否是特殊的动物
    let isCanBomb = (curClickCell.status != CELL_STATUS.COMMON &&
            lastClickCell.status != CELL_STATUS.COMMON) ||
             curClickCell.status == CELL_STATUS.BIRD ||
             lastClickCell.status == CELL_STATUS.BIRD;
    //不会发生消除的情况，互换后回到原来位置
    if(result1.length < 3 && result2.length < 3 && !isCanBomb){
        this.exchangeCell(lastPos, pos);//移动之前两个小动物的位置
        curClickCell.moveToAndBack(lastPos);
        lastClickCell.moveToAndBack(pos);//两个小动物交换位置
        this.lastPos = cc.p(-1, -1);
        return [this.changeModels];//返回到交换位置之前的原始位置
    }
    //能发生消除，可以互换位置
    else{
        this.lastPos = cc.p(-1,-1);
        curClickCell.moveTo(lastPos, this.curTime);
        lastClickCell.moveTo(pos, this.curTime);
        var checkPoint = [pos, lastPos];
        this.curTime += ANITIME.TOUCH_MOVE;
        this.processCrush(checkPoint);
        return [this.changeModels, this.effectsQueue];
    }
}
// 消除
GameModel.prototype.processCrush = function(checkPoint){
    let cycleCount = 0;
     while(checkPoint.length > 0){
        let bombModels = [];
        //特殊消除
        if(cycleCount == 0 && checkPoint.length == 2){ 
            let pos1= checkPoint[0];
            let pos2 = checkPoint[1];
            let model1 = this.cells[pos1.y][pos1.x];
            let model2 = this.cells[pos2.y][pos2.x];
            if(model1.status == CELL_STATUS.BIRD || model2.status ==  CELL_STATUS.BIRD){
                let bombModel = null;
                //如果当前其中一个为大鸟时，两个互换，大鸟变成与其互换的那个类型，并且消除所有同类型
                if(model1.status == CELL_STATUS.BIRD){
                    model1.type = model2.type;
                    bombModels.push(model1);
                }
                else{
                    model2.type = model1.type;
                    bombModels.push(model2);
                }

            }
        }
        for(var i in checkPoint){
            var pos = checkPoint[i];
            if(!this.cells[pos.y][pos.x]){
                continue;
            }
            var tmp = this.checkPoint(pos.x, pos.y);
            var result = tmp[0];
            var newCellStatus = tmp[1];//新生成的格子状态
            var newCellType = tmp[2];// 新生成的格子类型
           
            if(result.length < 3){
                continue;
            }
            for(var j in result){
                var model = this.cells[result[j].y][result[j].x];
                this.crushCell(result[j].x, result[j].y, false, cycleCount);// cell消除
                if(model.status != CELL_STATUS.COMMON){
                    bombModels.push(model);
                }
            }
            //新生成动物
            this.createNewCell(pos, newCellStatus, newCellType);   

        }
        this.processBomb(bombModels, cycleCount);
        this.curTime += ANITIME.DIE; // 动画播放的当前时间
        checkPoint = this.down();
        cycleCount++;
    }
}

//生成新cell
GameModel.prototype.createNewCell = function(pos,status,type){
    if(status == ""){
        return ;
    }
    if(status == CELL_STATUS.BIRD){
        type = CELL_TYPE.BIRD
    }
    let model = new CellModel();
    this.cells[pos.y][pos.x] = model
    model.init(type);
    model.setStartXY(pos.x, pos.y);
    model.setXY(pos.x, pos.y);
    model.setStatus(status);
    model.setVisible(0, false);
    model.setVisible(this.curTime, true);
    this.changeModels.push(model);
}
// 下落
GameModel.prototype.down = function(){
    let newCheckPoint = [];
     for(var i = 1;i<=GRID_WIDTH;i++){
        for(var j = 1;j <= GRID_HEIGHT;j++){
            if(this.cells[i][j] == null){
                var curRow = i;
                for(var k = curRow; k<=GRID_HEIGHT;k++){
                    if(this.cells[k][j]){
                        this.pushToChangeModels(this.cells[k][j]);
                        newCheckPoint.push(this.cells[k][j]);
                        this.cells[curRow][j] = this.cells[k][j];
                        this.cells[k][j] = null;
                        this.cells[curRow][j].setXY(j, curRow);
                        this.cells[curRow][j].moveTo(cc.p(j, curRow), this.curTime);
                        curRow++; 
                    }
                }
                var count = 1;

                //随机生成，不出现在Mask中
                for(var k = curRow; k<=GRID_HEIGHT; k++){
                    this.cells[k][j] = new CellModel();
                    this.cells[k][j].init(this.getRandomCellType());// 随要生成一个类型
                    this.cells[k][j].setStartXY(j, count + GRID_HEIGHT);
                    this.cells[k][j].setXY(j, count + GRID_HEIGHT);
                    this.cells[k][j].moveTo(cc.p(j, k), this.curTime);
                    count++;
                    this.changeModels.push(this.cells[k][j]);
                    newCheckPoint.push(this.cells[k][j]);
                }

            }
        }
    }
    this.curTime += ANITIME.TOUCH_MOVE + 0.3
    return newCheckPoint;
}

GameModel.prototype.pushToChangeModels = function(model){
    if(this.changeModels.indexOf(model) != -1){
        return ;
    }
    this.changeModels.push(model);
}

GameModel.prototype.cleanCmd = function(){
    for(var i = 1;i<=GRID_WIDTH;i++){
        for(var j = 1;j <= GRID_HEIGHT;j++){
            if(this.cells[i][j]){
                this.cells[i][j].cmd = [];
            }
        }
    }
}

//交换位置
GameModel.prototype.exchangeCell = function(pos1, pos2){
    var tmpModel = this.cells[pos1.y][pos1.x];
    this.cells[pos1.y][pos1.x] = this.cells[pos2.y][pos2.x];
    this.cells[pos1.y][pos1.x].x = pos1.x;
    this.cells[pos1.y][pos1.x].y = pos1.y;
    this.cells[pos2.y][pos2.x] = tmpModel;
    this.cells[pos2.y][pos2.x].x = pos2.x;
    this.cells[pos2.y][pos2.x].y = pos2.y;
}

// 设置种类
GameModel.prototype.setCellTypeNum = function(num){
    this.cellTypeNum = num;
    this.cellCreateType = [];
    for(var i = 1; i<= num;i++){
        while(true){
            var randomNum = Math.floor(Math.random() * CELL_BASENUM) + 1;
            if(this.cellCreateType.indexOf(randomNum) == -1){
                this.cellCreateType.push(randomNum);
                break;
            }
        }
    }
}
// 随要生成一个类型
GameModel.prototype.getRandomCellType = function(){
    var index = Math.floor(Math.random() * this.cellTypeNum) ;
    return this.cellCreateType[index];
}
// bombModels去重
GameModel.prototype.processBomb = function(bombModels, cycleCount){
    while(bombModels.length > 0){
        let newBombModel = [];
        let bombTime = ANITIME.BOMB_DELAY;
        bombModels.forEach(function(model){
            //横向消除
            if(model.status == CELL_STATUS.LINE){
                for(let i = 1; i<= GRID_WIDTH; i++){
                    if(this.cells[model.y][i]){
                        if(this.cells[model.y][i].status != CELL_STATUS.COMMON){
                            newBombModel.push(this.cells[model.y][i]);
                        }
                        this.crushCell(i, model.y, false, cycleCount);//false是是否需要消除前摇晃
                    }
                }
                this.addRowBomb(this.curTime, cc.p(model.x, model.y));
            }
            //纵向消除
            else if(model.status == CELL_STATUS.COLUMN){
                for (let i = 1; i <= GRID_HEIGHT; i++) {
                    if (this.cells[i][model.x]) {
                        if (this.cells[i][model.x].status != CELL_STATUS.COMMON) {
                            newBombModel.push(this.cells[i][model.x]);
                        }
                        this.crushCell(model.x, i, false, cycleCount);
                    }
                }
                this.addColBomb(this.curTime, cc.p(model.x, model.y));
            }
            //三消
            else if(model.status == CELL_STATUS.WRAP){
                let x = model.x;
                let y = model.y;
                for(let i = 1;i <= GRID_HEIGHT; i++){
                    for(let j = 1;j <= GRID_WIDTH; j++){
                        let delta = Math.abs(x - j) + Math.abs(y - i);
                        if(this.cells[i][j] && delta <= 2){
                            if (this.cells[i][j].status != CELL_STATUS.COMMON) {
                                newBombModel.push(this.cells[i][j]);
                            }
                            this.crushCell(j, i, false, cycleCount);
                        }
                    }
                }
            }
            //大鸟消除
            else if(model.status == CELL_STATUS.BIRD){
                let crushType = model.type
                if(bombTime < ANITIME.BOMB_BIRD_DELAY){
                    bombTime = ANITIME.BOMB_BIRD_DELAY;
                }
                if(crushType == CELL_TYPE.BIRD){
                    crushType = this.getRandomCellType(); 
                }
                for(let i = 1;i <= GRID_HEIGHT; i++){
                    for(let j = 1;j <= GRID_WIDTH; j++){
                        if(this.cells[i][j] && this.cells[i][j].type == crushType){
                            if (this.cells[i][j].status != CELL_STATUS.COMMON) {
                                newBombModel.push(this.cells[i][j]);
                            }
                            this.crushCell(j, i, true, cycleCount);
                        }
                    }
                }
            }
        },this);
        if(bombModels.length > 0){
            this.curTime += bombTime;
        }
        bombModels = newBombModel;
    }
}


// {开始播放的时间} playTime
// {cell位置} pos
//{第几次消除，用于播放音效} step 
GameModel.prototype.addCrushEffect = function(playTime, pos, step){
    this.effectsQueue.push({
        playTime,
        pos,
        action: "crush",
        step
    });
}

GameModel.prototype.addRowBomb = function(playTime, pos){
    this.effectsQueue.push({
        playTime,
        pos,
        action: "rowBomb"
    });
}

GameModel.prototype.addColBomb = function(playTime, pos){
    this.effectsQueue.push({
        playTime,
        pos,
        action: "colBomb"
    });
}

// cell消除
GameModel.prototype.crushCell = function(x, y, needShake, step){
    let model = this.cells[y][x];
    this.pushToChangeModels(model);
    if(needShake){
        model.toShake(this.curTime)
        model.toDie(this.curTime + ANITIME.DIE_SHAKE);
    }
    else{
        model.toDie(this.curTime);
    }
    this.addCrushEffect(this.curTime, cc.p(model.x, model.y), step);
    this.cells[y][x] = null;
}
