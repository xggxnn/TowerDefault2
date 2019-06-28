import WarManagers from "./WarManagers";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Stars extends cc.Component {

    @property([cc.SpriteFrame])
    pic: cc.SpriteFrame[] = [];
    @property(cc.Sprite)
    cur: cc.Sprite = null;
    @property(cc.Node)
    select: cc.Node = null;

    // 颜色序号
    colorNum: number = -1;
    // 地图位置
    indexOf: cc.Vec2 = new cc.Vec2();
    // 是否已经连线
    haveLine: boolean = false;
    // 连线的节点序号
    lineIndex: number = 0;
    warManger: WarManagers = null;

    // onLoad () {}

    init(num: number, i: number, j: number, war: WarManagers) {
        let change = true;
        if (this.warManger != null && this.indexOf.x == i && this.indexOf.y == j) {
            change = false;
        }
        else {
            this.colorNum = num;
            this.cur.spriteFrame = this.pic[num];
            this.indexOf = new cc.Vec2(i, j);
            this.warManger = war;
        }
        return change;
    }

    mouseMove() {
        if (this.warManger.clickMoveTo > 0 && this.warManger.clickColorNum == this.colorNum) {
            if (this.haveLine) {
                // 已连上，判断是否回退
                if (this.lineIndex == this.warManger.clickMoveTo - 1) {
                    // 回退
                    this.lineToClear();
                }
            }
            else {
                // 未连接，连接上
                if (this.warManger.judgeCanLine(this.indexOf.x, this.indexOf.y)) {
                    this.lineToArray();
                }
            }
        }

    }
    mouseDown() {
        if (this.warManger.clickMoveTo == 0) {
            this.select.active = true;
            this.warManger.clickStarArray[0] = this.indexOf;
            this.lineIndex = 1;
            this.haveLine = true;
            this.warManger.clickColorNum = this.colorNum;
            this.warManger.clickMoveTo = 1;
            this.warManger.searchCanLine(this);
            this.node.setScale(0.8, 0.8);
        }
    }

    //连上
    lineToArray() {
        this.node.setScale(0.8, 0.8);
        this.select.active = true;
        this.haveLine = true;
        this.warManger.clickStarArray[this.warManger.clickMoveTo] = this.indexOf;
        this.warManger.clickMoveTo++;
        this.lineIndex = this.warManger.clickMoveTo;
        this.warManger.toCreatLine(this);
    }
    // 回退 操作上一个点
    lineToClear() {
        this.warManger.starArrayTem[this.warManger.clickMoveTo - 2].clearThisLine();
        this.warManger.toRetrunLine();
    }

    clearThisLine() {
        this.node.setScale(1, 1);
        this.select.active = false;
        this.haveLine = false;
        this.lineIndex = 0;
    }

    showTip() {
        this.closeTip();
        this.node.runAction(this.setFade());
    }
    setFade() {
        let fad = cc.fadeTo(0.5, 100);
        let fadb = cc.fadeTo(0.5, 255);
        return cc.repeatForever(cc.sequence(fad, fadb));
    }
    closeTip() {
        this.node.stopAllActions();
    }

    moveToNewPos(pos: cc.Vec2, durt: number = 0) {
        var _MoveTo = cc.moveTo(0.3 + durt, pos).easing(cc.easeCircleActionInOut());
        let warman = this.warManger;
        this.node.runAction(cc.sequence(_MoveTo, cc.callFunc(function () {
            this.node.setPosition(pos.x, pos.y);
            warman.canStartGame();
        }, this)));
    }

    // update (dt) {}
}
