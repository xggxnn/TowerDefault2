import UserData from "./UserData";
import Rcode from "./Rcode";
import ShareFriend from "./ShareFriend";
import AdManager from "./AdManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Menu extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    startNode: cc.Node = null;
    @property(
        {
            type: cc.AudioClip
        }
    )
    clickAudio: cc.AudioClip = null;

    @property(cc.Prefab)
    recodePrefab: cc.Prefab = null;
    @property(cc.Node)
    recodeNode: cc.Node = null;
    @property(cc.Node)
    recodeParent: cc.Node = null;
    recodeList: Rcode[] = [];

    @property(cc.Node)
    sortNode: cc.Node = null;

    @property(cc.Node)
    sortBtnNode: cc.Node = null;

    @property(cc.Animation)
    starAni: cc.Animation = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        UserData.saveLog("menu enter Menu");
        let frameSize = cc.view.getFrameSize();
        let _canvas = this.node.getComponent(cc.Canvas);
        _canvas.fitHeight = frameSize.height / frameSize.width < 1.7;
        _canvas.fitWidth = frameSize.height / frameSize.width >= 1.7;
        this.haveLoadToWar = false;
        // 预加载战斗场景
        cc.director.preloadScene("war");
        if (wx.setScreenBrightness) {
            wx.setKeepScreenOn({
                keepScreenOn: true
            });
        }
        UserData.setNode(this.node);
        this.node.on("videoOk", this.adsRestart, this);
        AdManager.onLoadAd();
    }

    start() {
        this.starAni.play().repeatCount = Infinity;
        this.label.string = "最高得分：" + UserData.bestScore;
        if (this.userInfo != null) {
            UserData.setUserInf(this.userInfo);
        }
        AdManager.show();
    }


    private haveLoadToWar = false;
    clickHandle(event, cusData) {
        cc.audioEngine.play(this.clickAudio, false, 1);
        var node = event.target;
        switch (cusData) {
            case "start":
                UserData.saveLog("menu start Game Btn");
                // 开始游戏
                if (!this.haveLoadToWar) {
                    UserData.score = 0;
                    UserData.lvNum = 1;
                    cc.director.loadScene("war");
                    this.haveLoadToWar = true;
                }
                break;
            case "max":
                UserData.saveLog("menu open maxScore List");
                // 最高记录
                let dates = UserData.starUserDate;
                if (this.recodeList.length == 0) {
                    for (let i = 0; i < 3; i++) {
                        let rec = cc.instantiate(this.recodePrefab);
                        this.recodeNode.addChild(rec);
                        rec.setPosition(0, -50 - i * 120);
                        let rcode: Rcode = rec.getComponent('Rcode');
                        rcode.init(i, this.clickAudio, dates);
                        this.recodeList.push(rcode);
                    }
                }
                else {
                    for (let i = 0; i < 3; i++) {
                        this.recodeList[i].reInit(i, dates);
                    }
                }
                this.recodeParent.active = true;
                this.startNode.active = false;
                break;
            case "closeRecode":
                UserData.saveLog("menu close maxScore List");
                this.recodeParent.active = false;
                this.startNode.active = true;
                break;
            case "sort":
                // 排行榜
                if (UserData.isMobile && this.userInfo) {
                    UserData.saveLog("menu open sort");
                    UserData.refrushMessageUp();
                    this.startNode.active = false;
                    this.sortNode.active = true;
                }
                break;
            case "closeSort":
                UserData.saveLog("menu close sort");
                // 排行榜
                this.startNode.active = true;
                this.sortNode.active = false;
                break;
            case "share":
                UserData.saveLog("menu open share");
                ShareFriend.share();
                break;
            case "closeTip":
                this.tipNode.active = false;
                break;
        }
    }

    @property(cc.Node)
    tipNode: cc.Node = null;

    adsRestart(): void {
        cc.director.loadScene("war");
    }

    update(dt) {
        AdManager.updates(dt);
        if (UserData.isMobile && this.userInfo == null) {
            if (this.sortBtn == null) {
                let systemInfo = wx.getSystemInfoSync();
                let width = systemInfo.windowWidth;
                let height = systemInfo.windowHeight;
                this.sortBtn = wx.createUserInfoButton({
                    type: 'text',
                    text: '',
                    style: {
                        left: 0,
                        top: 0,
                        width: width,
                        height: height,
                        lineHeight: 40,
                        backgroundColor: '#00000000',
                        color: '#00000000',
                        textAlign: 'center',
                        fontSize: 10,
                        borderRadius: 4
                    }
                });
            }
            this.sortBtn.onTap((res) => {
                if (!res.userInfo) {
                    console.error("reqErroe:", res.errMsg);
                }
                else {
                    this.userInfo = res.userInfo;
                    UserData.setUserInf(this.userInfo);
                    this.sortBtn.hide();
                    this.sortBtn.destroy();
                }
            })
        }
    }
    userInfo = null;
    openData = null;
    sortBtn = null;
}
