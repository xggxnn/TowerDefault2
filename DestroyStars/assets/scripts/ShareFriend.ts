import UserData from "./UserData";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShareFriend extends cc.Component {

    private static url: string = 'https://ms.yz063.com/wx/0001.png';
    private static title: string = '最劲爆的休闲游戏，玩得根本停不下来！';
    public static share() {
        if (UserData.isMobile) {
            wx.shareAppMessage(
                {
                    title: this.title,
                    imageUrl: this.url,
                    success: function (res) {
                        console.log("分享成功：", res);
                    },
                    fail: function (res) {
                        console.log("分享失败", res);
                    },
                }
            );
        }
    }

    public static onShare() {
        if (UserData.isMobile) {
            wx.showShareMenu({
                withShareTicket: false,
                success: null,
                fail: null,
                complete: null,
            });
            wx.onShareAppMessage(

                (res) => {
                    return {
                        title: this.title,
                        imageUrl: this.url,
                        success(res) {
                            console.log("转发成功!!!", res)
                        },
                        fail(res) {
                            console.log("转发失败!!!", res)
                        }
                    }
                }
            );
        }
    }
}



