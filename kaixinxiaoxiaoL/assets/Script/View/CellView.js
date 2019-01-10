
import {CELL_STATUS, CELL_WIDTH, CELL_HEIGHT, ANITIME} from '../Model/ConstValue';

cc.Class({
    extends: cc.Component,

    properties: {
    
        defaultFrame:{
            default: null,
            type: cc.SpriteFrame
        }
    },
  
    onLoad: function () {
        this.isSelect = false;
    },

        //设置网格的位置
    initWithModel: function(model){
        this.model = model;
        var x = model.startX;
        var y = model.startY;
        this.node.x = CELL_WIDTH * (x - 0.5);
        this.node.y = CELL_HEIGHT * (y - 0.5);

        //获取动画组件上的动画
        var animation  = this.node.getComponent(cc.Animation);
        if (model.status == CELL_STATUS.COMMON){
            animation.stop();
        } 
        else{
            animation.play(model.status);
        }
    },

    // 执行移动动作
    updateView: function(){
        var cmd = this.model.cmd;//各种控制
        if(cmd.length <= 0){
            return ;
        }
        var actionArray = [];//将动画做成一个数组
        var curTime = 0;//当前动画时间默认为0
        for(var i in cmd){
            //
            if( cmd[i].playTime > curTime){
                var delay = cc.delayTime(cmd[i].playTime - curTime);//delayTime延迟指定的时间量
                actionArray.push(delay);
            }
            //可以移动时移动后的坐标
            if(cmd[i].action == "moveTo"){
                var x = (cmd[i].pos.x - 0.5) * CELL_WIDTH;
                var y = (cmd[i].pos.y - 0.5) * CELL_HEIGHT;
                var move = cc.moveTo(ANITIME.TOUCH_MOVE, cc.p(x,y));
                actionArray.push(move);
            }
            else if(cmd[i].action == "toDie"){
                //如果当前的状态为大鸟时
                if(this.status == CELL_STATUS.BIRD){
                    //获取动画组件上的大鸟爆炸效果动画
                    let animation = this.node.getComponent(cc.Animation);
                    animation.play("effect");
                    actionArray.push(cc.delayTime(ANITIME.BOMB_BIRD_DELAY));
                }
                //回调函数
                //让这些节点摧毁消失
                var callFunc = cc.callFunc(function(){
                    this.node.destroy();
                },this);
                actionArray.push(callFunc);
            }
            //设置是否可视
            else if(cmd[i].action == "setVisible"){
                let isVisible = cmd[i].isVisible;
                actionArray.push(cc.callFunc(function(){
                    if(isVisible){
                        //可视
                        this.node.opacity = 255;//opacity透明度
                    }
                    else{
                        //不可视
                        this.node.opacity = 0;
                    }
                },this));
            }
            else if(cmd[i].action == "toShake"){
                let a= 0;
                let tmpAction = cc.rotateBy(0.4,60);//消除前0.4秒内转动60度
                actionArray.push(tmpAction);
            }
            curTime = cmd[i].playTime + cmd[i].keepTime;
        }
        

        if(actionArray.length == 1){
            this.node.runAction(actionArray[0]);
        }
        else{
            this.node.runAction(cc.sequence(...actionArray));// 顺序执行动作，创建的动作将按顺序依次运行。
        }

    },

        //设置单元格中的内容
    setSelect: function(flag){
        var animation = this.node.getComponent(cc.Animation);
        var bg = this.node.getChildByName("select");
        //如果单元格空白，这个单元格就可以放随机生成的小动物
        if(flag == false && this.isSelect==true && this.model.status == CELL_STATUS.COMMON){
            animation.stop();
            this.node.getComponent(cc.Sprite).spriteFrame = this.defaultFrame;
        }
        //如果单元格中已经有动物了，则当前就可以点击了
        else if(flag==true && this.model.status == CELL_STATUS.COMMON){
            animation.play(CELL_STATUS.CLICK);
        }
        else if(flag==true && this.model.status == CELL_STATUS.BIRD){
            animation.play(CELL_STATUS.CLICK);
        }
        bg.active = flag; 
        this.isSelect = flag;
    }
});
