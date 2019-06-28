import UserData from "./UserData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AdManager extends cc.Component {

    static bannerAd: any;
    static videoAd: any;
    static loadState: number = 0;

    private static banAdStatus: boolean = false;
    static show(): void {
        if (!this.banAdStatus) {
            this.banAdStatus = true;
            this.bannerAd.show();
            let winSize = wx.getSystemInfoSync();
            this.bannerAd.onResize(res => {
                this.bannerAd.style.top = winSize.windowHeight - this.bannerAd.style.realHeight;
            })
        }
    }

    static videoShow(): void {
        // 用户触发广告后，显示激励视频广告
        if (this.videoAd) {
            this.videoAd.show().catch(() => {
                // 失败重试
                this.videoAd.load()
                    .then(() => this.videoAd.show())
                    .catch(err => {
                        console.log('激励视频 广告显示失败')
                        AdManager.loadState = 0;
                    })
            })
        }
        else {
            console.log("no video");
            AdManager.loadState = 0;
        }
    }

    static onLoadAd() {
        this.banAdStatus = false;
        // 创建 Banner 广告实例，提前初始化
        this.bannerAd = wx.createBannerAd({
            adUnitId: 'adunit-8fd21b11a826c09e',
            style: {
                left: 0,
                top: 0,
                width: 720
            }
        })

        this.bannerAd.onError(function (res) {
            console.log("广告报错：", res);
        })

        // 创建激励视频广告实例，提前初始化
        this.videoAd = wx.createRewardedVideoAd({
            adUnitId: 'adunit-073ecbb1bd48bc53'
        })

        this.videoAd.onLoad(function () {
            console.log("videoAd load success");
            AdManager.loadState = 1;
        })
        this.videoAd.onClose(function (res) {
            console.log("videoAd onClose:");
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res === undefined || (res && res.isEnded)) {
                AdManager.loadState = 0;
                // 正常播放结束，可以下发游戏奖励
                UserData.emitt("videoOk");
            } else {
                // 播放中途退出，不下发游戏奖励
            }
        })
        this.videoAd.onError(function (err) {
            console.log("videoAd load error:", err);
            AdManager.loadState = 0;
        })
    }

    public static get usable() {
        return AdManager.loadState == 1;
    }
    static updates(dt) {
        if (AdManager.loadState != 0) {
            return;
        }
        if (AdManager.videoAd == null) {
            return;
        }
        AdManager.loadState = 2;
        AdManager.videoAd.load();
    }
}
