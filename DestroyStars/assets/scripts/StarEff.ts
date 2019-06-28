import StarEffect from "./StarEffect";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class StarEff extends cc.Component {

    @property(cc.Sprite)
    cur: cc.Sprite = null;
    effectManager: StarEffect = null;
    calBack: Function = null;

    init(effectManager: StarEffect, pic: cc.SpriteFrame, calBack: Function) {
        this.effectManager = effectManager;
        this.cur.spriteFrame = pic;
        this.calBack = calBack;
        this.node.opacity = 255;
        this.node.active = true;
        this.speedX = Math.random() * 10 - 5;
        this.speedY = Math.random() * 10 + 10;
    }

    speedX: number = 0;
    speedY: number = 0;
    speedG: number = 1;
    update(dt) {
        this.node.x += this.speedX;
        this.node.y += this.speedY;
        this.speedY -= this.speedG;
        this.node.opacity -= 5;
        if (this.node.opacity <= 0) {
            this.calBack();
        }
    }

}
