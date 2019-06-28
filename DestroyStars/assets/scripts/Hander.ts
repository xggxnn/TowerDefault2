const { ccclass, property } = cc._decorator;

@ccclass
export default class Hander extends cc.Component {

    private duration: number = 1;
    moveToNewPos(pos: cc.Vec2[], self: boolean = false) {
        if (self && this.status == 100) {
            return;
        }
        this.status = 1;
        this.pos = pos;
        let len = pos.length;
        this.node.setPosition(pos[0]);
        if (len <= 1) return;
        this.node.opacity = 255;
        let actList: cc.FiniteTimeAction[] = [];
        for (let i = 0; i < len; i++) {
            actList.push(cc.moveTo(this.duration, pos[i]));
        }
        let action = cc.sequence(actList);
        this.startAction = true;
        this.actioner = this.node.runAction(action);
    }
    hideThis() {
        this.node.stopAllActions();
        this.node.opacity = 0;
        this.actioner = null;
        this.startAction = false;
        this.status = 100;
    }

    private actioner: cc.Action = null;
    private startAction: boolean = false;
    private status: number = 0;
    private pos: cc.Vec2[];

    update(dt) {
        if (this.startAction && this.actioner != null) {
            if (this.actioner.isDone()) {
                this.node.opacity = 0;
                this.status++;
                if (this.status % 50 == 0) {
                    this.actioner = null;
                    this.moveToNewPos(this.pos, true);
                }
            }
        }
    }

}
