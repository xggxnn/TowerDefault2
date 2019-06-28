import WarManagers from "./WarManagers";

const { ccclass, property } = cc._decorator;
// import md5 from "md5/md5";

@ccclass
export default class UserData {


    private static _warNode: cc.Node = null;
    public static setNode(node: cc.Node): void {
        this._warNode = node;
    }

    public static emitt(str: string): void {
        this._warNode.emit(str);
    }



    public static get isMobile(): boolean {
        return cc.sys.isMobile
    }

    private static _newbie: boolean = true;
    public static get newbie(): boolean {
        return this._newbie;
    }
    public static set newbie(v: boolean) {
        this._newbie = v;
        cc.sys.localStorage.setItem("newbie", "ok");
    }

    /** 游戏总分数 */
    private static _score: number = 0;
    static get score(): number {
        return UserData._score;
    }
    static set score(value: number) {
        UserData._score = value;
    }



    /** 历史最高分 */
    static get bestScore(): number {
        return this._starUserDate[0][1];
    }

    /** 当前关卡 */
    private static _lvNum: number = 1;
    public static get lvNum(): number {
        return this._lvNum;
    }
    public static set lvNum(v: number) {
        this._lvNum = v;
        UserData.saveLog("war lv complete lvNumber and scoreNumber", [this._lvNum, UserData._score]);
    }

    /** 通关需要的分数 */
    private static _passScore: number[] = [750, 1500, 3000];
    public static get passScore(): number {
        if (this.lvNum < 4) {
            return this._passScore[this.lvNum - 1];
        }
        return 4500 + 1500 * (this.lvNum - 4) + (this.lvNum - 4) * (this.lvNum - 5) / 2 * 300;
    }

    public static numForScore(num: number): number {
        let s = 0;
        if (num > 3) {
            s = (10 + 5 * (num - 3)) * num;
        }
        else {
            s = 10 * num;
        }
        return s;
    }


    private static curSave = -1;
    /** 存储数据 */
    public static save() {
        if (this.curSave == -1) {
            if (this._starUserDate[9][1] < this.score) {
                this._starUserDate[9][1] = this.score;
                this._starUserDate[9][0] = this.lvNum;
                this.curSave = 9;
            }
        }
        else {
            this._starUserDate[this.curSave][1] = this.score;
            this._starUserDate[this.curSave][0] = this.lvNum;
        }
        if (this.curSave >= 0) {
            this._starUserDate.sort(
                (item1, item2) => {
                    if (item1[1] < item2[1]) return 1;
                    else if (item1[1] > item2[1]) return -1;
                    else return 0
                }
            );
            for (let i = 0; i < 10; i++) {
                if (this._starUserDate[i][0] == this.lvNum && this._starUserDate[i][1] == this.score) {
                    this.curSave = i;
                    break;
                }
            }
            let dates = {
                topArray: this._starUserDate,
            }
            let date = JSON.stringify(dates);
            cc.sys.localStorage.setItem("starUserDate", date.toString());
            this.sendMessageUp();
        }
    }

    /** 读取数据 */
    public static read() {
        let tttt = cc.sys.localStorage.getItem("newbie");
        if (tttt == "ok") this._newbie = false;
        let _save = cc.sys.localStorage.getItem("starUserDate");
        if (_save) {
            let _date: number[][] = JSON.parse(_save).topArray;
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 2; j++) {
                    this._starUserDate[i][j] = _date[i][j];
                }
            }
        }
    }

    private static _starUserDate: number[][] = [[1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0], [1, 0]];
    public static get starUserDate(): number[][] {
        return this._starUserDate;
    }

    /** 保存微信云数据 */
    public static sendMessageUp() {
        if (UserData.isMobile) {
            wx.getOpenDataContext().postMessage({
                message: UserData.starUserDate[0][1].toString(),
            });
        }
    }

    public static refrushMessageUp() {
        if (UserData.isMobile) {
            wx.getOpenDataContext().postMessage({
                refrush: 1,
            });
        }
    }
    public static refrushFailMessageUp() {
        if (UserData.isMobile) {
            wx.getOpenDataContext().postMessage({
                refrush2: 1,
            });
        }
    }

    private static _userInf = null;
    public static setUserInf(_userInf) {
        this._userInf = _userInf;
    }
    private static _userCodeId: string = null;
    private static getUserInf(): string {
        this._userCodeId = cc.sys.localStorage.getItem("usercodeId");
        if (!this._userCodeId || this._userCodeId == null || this._userCodeId.length <= 0) {
            let result = "1";
            if (UserData.isMobile) {
                let systemInfo = wx.getSystemInfoSync();
                result = systemInfo.platform + systemInfo.model + systemInfo.system;
                if (this._userInf != null) {
                    result += this._userInf.country + this._userInf.province + this._userInf.nickName + this._userInf.avatarUrl;
                    console.log(this._userInf);
                }
            }
            var md5 = require('md5/md5')
            this._userCodeId = md5(result);
            cc.sys.localStorage.setItem("usercodeId", this._userCodeId);
        }
        return this._userCodeId;
    }
    public static saveLog(str: string, arg: Array<any> = null) {
        let logObj = this.formateTime();
        logObj += "@" + this.getUserInf();
        logObj += "@" + str;
        if (arg != null) {
            logObj += "@" + arg[0];
            let len = arg.length;
            if (len > 1) {
                for (let i = 1; i < len; i++) {
                    logObj += "," + arg[i];
                }
            }
        }
        wx.request({
            url: 'https://log.yz063.com/log/star/client/upload', //仅为示例，并非真实的接口地址
            data: logObj,
            header: {
                'content-type': 'application/text' // 默认值
            },
            method: "POST",
            dataType: "text",
            responseType: "text",
            success(res) { },
            fail: null,
            complete: null
        })
    }

    private static formateTime(): string {
        let times = new Date();
        return times.getFullYear() + "-" + times.getMonth() + "-" + times.getDate() + " " + times.getHours() + ":" + times.getMinutes() + ":" + times.getSeconds();
    }

    private static _playClearNum: number = 0;
    // 玩家消除次数
    public static get playClearNum(): number {
        if (this._playClearNum == 0) {
            this._playClearNum = Number(cc.sys.localStorage.getItem("playClearNum"));
        }
        return this._playClearNum;
    }
    public static set playClearNum(v: number) {
        this._playClearNum = v;
        cc.sys.localStorage.setItem("playClearNum", this._playClearNum);
    }

}
