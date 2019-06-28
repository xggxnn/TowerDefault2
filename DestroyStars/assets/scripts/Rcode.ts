import UserData from "./UserData";
import AdManager from "./AdManager";
import Menu from "./Menu";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Rcode extends cc.Component {

    @property(cc.Label)
    lv: cc.Label = null;
    @property(cc.Label)
    score: cc.Label = null;
    @property([cc.Node])
    sort: cc.Node[] = [];
    @property(cc.Label)
    sortO: cc.Label = null;
    @property(cc.Button)
    continueBtn: cc.Button = null;

    index: number;
    clickAudio: cc.AudioClip = null;
    curDate: number[] = [1, 0];

    start() {

    }

    public init(index: number, clickAudio: cc.AudioClip, dates: number[][], menu: Menu) {
        if (this.menu == null) {
            this.menu = menu;
        }
        this.continueBtn.node.on('click', this.clickBtn, this)
        this.index = index;
        this.clickAudio = clickAudio;
        this.reInit(index, dates);
    }

    public reInit(index: number, dates: number[][]) {
        this.index = index;
        let num = index + 1;
        this.curDate = dates[index];
        this.lv.string = "关卡：" + this.curDate[0];
        this.score.string = "分数：" + this.curDate[1];
        if (index < 3) {
            this.sort[index].active = true;
            this.sortO.node.active = false;
        }
        else {
            this.sortO.node.active = true;
            this.sortO.string = num.toString();
        }
    }

    clickBtn() {
        cc.audioEngine.play(this.clickAudio, false, 1);
        if (AdManager.usable) {
            UserData.score = this.curDate[1];
            UserData.lvNum = this.curDate[0];
            AdManager.videoShow();
        }
        else {
            this.menu.tipNode.active = true;
        }
    }
    private menu: Menu = null;
    // update (dt) {}
}
