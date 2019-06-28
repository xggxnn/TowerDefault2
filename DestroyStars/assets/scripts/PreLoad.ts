import ShareFriend from "./ShareFriend";
import UserData from "./UserData";
import AdManager from "./AdManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PreLoad extends cc.Component {

    @property(
        {
            type: cc.AudioClip
        }
    )
    bgm: cc.AudioClip = null;

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;
    @property(cc.Label)
    tip: cc.Label = null;


    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        UserData.read();
        UserData.saveLog("preload onLoad");
        cc.audioEngine.play(this.bgm, true, 1);
        ShareFriend.onShare();
        if (wx.setScreenBrightness) {
            wx.setKeepScreenOn({
                keepScreenOn: true
            });
        }
    }

    start() {
        if (UserData.newbie) {
            cc.director.preloadScene("war",
                (compleCount: number, totalCount: number, item: any) => {
                    this.progress.progress = compleCount / totalCount;
                    if (compleCount < totalCount) {
                        this.tip.string = "正在加载 " + item._ownerProp + " （" + compleCount + "/" + totalCount + "）";
                    }
                },
                (error: Error, asset: cc.SceneAsset) => {
                    UserData.saveLog("preload over");
                    this.tip.string = "加载完成，正在进入场景";
                    if (error == null) {
                        UserData.score = 0;
                        UserData.lvNum = 1;
                        cc.director.loadScene("war");
                    }
                }
            )
        }
        else {
            cc.director.preloadScene("menu",
                (compleCount: number, totalCount: number, item: any) => {
                    this.progress.progress = compleCount / totalCount;
                    if (compleCount < totalCount) {
                        this.tip.string = "正在加载 " + item._ownerProp + " （" + compleCount + "/" + totalCount + "）";
                    }
                },
                (error: Error, asset: cc.SceneAsset) => {
                    UserData.saveLog("preload over");
                    this.tip.string = "加载完成，正在进入场景";
                    if (error == null) {
                        cc.director.loadScene("menu");
                    }
                }
            )
        }
    }

    // update (dt) {}
}
