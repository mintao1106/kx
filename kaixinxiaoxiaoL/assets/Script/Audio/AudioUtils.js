// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        //交换声音
        swap: {
            url: cc.AudioClip,
            default: null
        },
        //点击声音
        click: {
            url: cc.AudioClip,
            default: null
        },
        //消除声音
        eliminate:{
            url: [cc.AudioClip],
            default: [],
        },
        //连续自动消除声音
        continuousMatch:{
            url: [cc.AudioClip],
            default: []
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    },

    start () {

    },
    playClick: function(){
        cc.audioEngine.play(this.click, false, 1);
    },
    playSwap: function(){
        cc.audioEngine.play(this.swap, false, 1);
    },
    playEliminate: function(step){
        step = Math.min(this.eliminate.length - 1, step);
        cc.audioEngine.play(this.eliminate[step], false, 1);
    },
    playContinuousMatch: function(step){
        console.log("step = ", step);
        step = Math.min(step, 11);
        if(step < 2){
            return 
        }
        cc.audioEngine.play(this.continuousMatch[Math.floor(step/2) - 1], false, 1);
    }

    // update (dt) {},
});
