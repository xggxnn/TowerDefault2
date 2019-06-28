import Stars from "./Stars";
import UserData from "./UserData";
import StarEffect from "./StarEffect";
import Hander from "./Hander";
import AdManager from "./AdManager";
import ShareFriend from "./ShareFriend";

const { ccclass, property } = cc._decorator;

@ccclass
export default class WarManagers extends cc.Component {

    @property(cc.Animation)
    tipAni: cc.Animation = null;
    @property(StarEffect)
    starEffect: StarEffect = null;
    @property(cc.Prefab)
    starPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    linePrefab: cc.Prefab = null;
    @property(cc.Node)
    starNode: cc.Node = null;
    @property(cc.Node)
    lineNode: cc.Node = null;
    @property(cc.Node)
    passTip: cc.Node = null;
    @property(cc.Label)
    curScore: cc.Label = null;
    curScoreTem: number = 0;
    @property(cc.Prefab)
    scoreTipPrefab: cc.Prefab = null;
    @property(cc.Label)
    lv: cc.Label = null;
    @property(cc.Label)
    targetScore: cc.Label = null;
    @property(cc.Label)
    gainTip: cc.Label = null;
    @property(cc.Node)
    pauseMenu: cc.Node = null;
    @property(cc.Node)
    failMenu: cc.Node = null;
    @property(cc.Node)
    failMenuADBtn: cc.Node = null;
    @property(cc.Node)
    failMenuBkBtn: cc.Node = null;
    @property(cc.Node)
    rewardMenu: cc.Node = null;
    @property(cc.Label)
    rewardTip: cc.Label = null;
    @property(cc.Label)
    rewardTip2: cc.Label = null;
    @property(cc.Animation)
    rewardAni: cc.Animation = null;
    @property(cc.Animation)
    passAni: cc.Animation = null;
    @property([cc.Animation])
    goodAni: cc.Animation[] = [];

    @property(cc.Node)
    sortNode: cc.Node = null;

    @property(
        {
            type: [cc.AudioClip]
        }
    )
    goodAudio: cc.AudioClip[] = [];

    @property(
        {
            type: [cc.AudioClip]
        }
    )
    menuAudio: cc.AudioClip[] = [];

    _linePool: cc.NodePool = new cc.NodePool();
    _starPool: cc.NodePool = new cc.NodePool();
    _scoreTipPool: cc.NodePool = new cc.NodePool();

    colNum: number = 8;
    rowNum: number = 8;

    /** 当前星星数组 */
    starArray: Stars[][] = [];
    /** 当前连线中的星星 */
    starArrayTem: Stars[] = [];
    /** 第一个用户点击的星星 */
    firstStar: Stars = null;
    /** 已连线的位置 */
    clickStarArray: cc.Vec2[] = [];
    // 已连接几个
    clickMoveTo: number = 0;
    // 当前颜色序号
    clickColorNum: number = -1;
    /** 当前连线 */
    lineArray: cc.Node[] = [];

    /** 计时器 */
    timer: number = 0;
    starDuration: number = 5;
    userCanAction: Boolean = false;
    /** 可连线提示数组 */
    showTipArray: Stars[][] = [];
    /** 方向寻找 */
    _arr = [
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: -1, y: 1 },
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 }
    ];

    @property(cc.Label)
    failCurScore: cc.Label = null;
    @property(cc.Label)
    failPreScore: cc.Label = null;

    maxStarNum: number = 5;
    clearStarNum: number = 2;

    onLoad() {
        let frameSize = cc.view.getFrameSize();
        let _canvas = this.node.getComponent(cc.Canvas);
        _canvas.fitHeight = frameSize.height / frameSize.width < 1.7;
        _canvas.fitWidth = frameSize.height / frameSize.width >= 1.7;
        this.pauseMenu.active = false;
        this.failMenu.active = false;
        this.doubleAdNode.active = false;

        // 初始化方块对象池
        // 初始化连线对象池
        for (let i = 0; i < 100; i++) {
            let star = cc.instantiate(this.starPrefab);
            this._starPool.put(star);
            let line = cc.instantiate(this.linePrefab);
            this._linePool.put(line);
        }
        this.starArray = new Array(this.colNum);
        for (let i = 0; i < this.rowNum; i++) {
            this.starArray[i] = new Array(this.rowNum);
        }
        for (let i = 0; i < this.colNum; i++) {
            for (let j = 0; j < this.rowNum; j++) {
                this.starArray[i][j] = null;
            }
        }
        for (let i = 0; i < 3; i++) {
            let score = cc.instantiate(this.scoreTipPrefab);
            this._scoreTipPool.put(score);
        }
        this.node.on("touchcancel", this.mouseUp, this);
        this.node.on("touchstart", this.mouseDown, this);
        this.node.on("touchmove", this.mouseMove, this);
        this.node.on("touchend", this.mouseUp, this);
        this.newbieNode.opacity = 0;
        this.tipHander.hideThis();
        // 预加载主场景
        cc.director.preloadScene("menu");
        if (wx.setScreenBrightness) {
            wx.setKeepScreenOn({
                keepScreenOn: true
            });
        }
        let rightTop = wx.getMenuButtonBoundingClientRect();
        let wigh = this.tipAni.getComponent(cc.Widget);
        if (frameSize.width > 720) {
            wigh.right = 0;
        }
        else if (frameSize.width > 700) {
            wigh.right = frameSize.width - rightTop.left;
        }
        else {
            wigh.right = frameSize.width - rightTop.left + rightTop.width;
        }
        if (frameSize.height / frameSize.width > 2.1) {
            wigh.top = rightTop.top * -1 - 25;
        }
        else {
            wigh.top = rightTop.top;
        }
        if (frameSize.width > 700) {
            wigh.top = 0;
        }

        this.tipAni.play().repeatCount = Infinity;
        this.doubleCircle.play().repeatCount = Infinity;
        this.canClickBtn = false;
        UserData.setNode(this.node);
        this.node.on("videoOk", this.adsRestart, this);
    }

    @property(
        {
            type: cc.AudioClip
        }
    )
    clickAudio: cc.AudioClip = null;
    private canClickBtn: boolean = false;
    onClickBtn(event, custEventData) {
        cc.audioEngine.play(this.clickAudio, false, 1);
        if (UserData.newbie) return;
        if (!this.canClickBtn) return;
        switch (custEventData) {
            case "pause":
                UserData.saveLog("war pause btn");
                this.pauseMenu.active = true;
                break;
            case "continue":
                UserData.saveLog("war continue btn");
                this.pauseMenu.active = false;
                break;
            case "restart":
                UserData.saveLog("war restart btn");
                UserData.score = 0;
                UserData.lvNum = 1;
                cc.director.loadScene("menu");
                break;
            case "adsRestart":
                AdManager.videoShow();
                UserData.saveLog("war adsRestart btn");
                break;
            case "sort":
                UserData.saveLog("war sort btn");
                UserData.refrushMessageUp();
                this.failMenu.active = false;
                this.sortNode.active = true;
                // 排行榜
                break;
            case "closeSort":
                UserData.saveLog("war closeSort btn");
                this.sortNode.active = false;
                this.showFailedInf();
                this.failMenu.active = true;
                if (AdManager.usable) {
                    this.failMenuADBtn.active = true;
                    this.failMenuBkBtn.x = -164;
                }
                else {
                    this.failMenuADBtn.active = false;
                    this.failMenuBkBtn.x = 0;
                }
                break;
            case "double3":
                UserData.saveLog("share for double");
                ShareFriend.share();
                this.doubleShow();
                break;
            case "double4":
                UserData.saveLog("video for double");
                AdManager.videoShow();
                break;
            case "doubleAdd":
                UserData.saveLog("doubleAddScore");
                UserData.score += this.doubleScore;
                if (UserData.passScore <= UserData.score) {
                    if (!this.passTip.active) {
                        this.passAni.play();
                    }
                    this.passTip.active = true;
                }
                this.doubleAdNode.active = false;
                break;
            case "cancelDouble":
                UserData.saveLog("cancel double");
                this.doubleAdNode.active = false;
                this.moveOver2();
                break;
        }
    }

    @property(cc.Animation)
    doubleCircle: cc.Animation = null;
    @property(cc.Node)
    doubleAdNode: cc.Node = null;
    @property(cc.Node)
    doubleAdDouble: cc.Node = null;
    @property([cc.Node])
    double3: cc.Node[] = [];
    @property([cc.Node])
    double4: cc.Node[] = [];
    @property(cc.Node)
    doubleResult: cc.Node = null;
    @property(cc.Label)
    doubleNum: cc.Label = null;

    doubleShow(): void {
        this.doubleAdNode.active = true;
        this.doubleAdDouble.active = false;
        this.doubleNum.string = this.doubleScore.toString();
        this.doubleResult.active = true;
    }

    adsRestart(): void {
        if (this.isCheckAD) {
            this.doubleShow();
        }
        else {
            this.init();
            this.failMenu.active = false;
        }
    }

    mouseDown(event) {
        this.tipHander.hideThis();
        if (!this.userCanAction) return;
        let worldPoint = event.getLocation();
        let point: Stars = this.getMouseOverPoint(worldPoint);
        if (point != null) {
            this.gainTip.string = " ";
            if (this.canUseStar(point)) {
                cc.audioEngine.play(this.menuAudio[3], false, 1);
                point.mouseDown();
            }
        }
        this.timer = 0;
    }

    private canUseStar(point: Stars) {
        let canDown = true;
        if (UserData.newbie) {
            canDown = false;
            if (point.indexOf.x == 3) {
                if (point.indexOf.y == 3 || point.indexOf.y == 4) {
                    canDown = true;
                }
            }
            if (point.indexOf.x == 4) {
                if (point.indexOf.y == 4 || point.indexOf.y == 5) {
                    canDown = true;
                }
            }
        }
        return canDown;
    }

    _moveArr = [
        { x: -15, y: 15 },
        { x: 15, y: 75 },
        { x: 75, y: 105 },
        { x: 105, y: 165 },
        { x: 165, y: 180 },
        { x: -180, y: -165 },
        { x: -165, y: -105 },
        { x: -105, y: -75 },
        { x: -75, y: -15 }
    ];
    _arr2 = [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: -1, y: -1 },
        { x: -1, y: 0 },
        { x: -1, y: 0 },
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: 1, y: -1 }
    ];
    _pArr = [30, 90, 120, 180, 210, 270, 300, 360];
    _pArr2 = [
        { x: -1, y: 0 },
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: 1, y: -1 },
        { x: 1, y: 0 },
        { x: 1, y: 1 },
        { x: 0, y: 1 },
        { x: -1, y: 1 },
    ];

    mouseMove(event) {
        if (!this.userCanAction || this.clickMoveTo <= 0) return;
        // 新连接方式
        // 鼠标位置
        let worldPoint = event.getLocation();
        // 当前是否在方块上
        let point: Stars = this.getMouseOverPoint(worldPoint);
        if (point != null && this.clickColorNum == point.colorNum) {
            if (this.canUseStar(point)) {
                point.mouseMove();
            }
        }
        else {
            // 上一个点 starWH
            let i = this.clickStarArray[this.clickMoveTo - 1].x;
            let j = this.clickStarArray[this.clickMoveTo - 1].y;
            let nodePos = this.starNode.convertToWorldSpace(this.starArray[i][j].node.position);

            // 判断方向，
            let x = worldPoint.x - nodePos.x;
            let y = worldPoint.y - nodePos.y;
            let hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
            let _ang = (Math.floor(Math.atan2(y, x) * 180 / Math.PI) + 180 + 15) % 360;
            if (hypotenuse > 65) {
                let toward = 0;
                // 朝向哪个方向
                for (let k = 0; k < 8; k++) {
                    if (_ang < this._pArr[k]) {
                        toward = k;
                        break;
                    }
                }
                let _pos = this._pArr2[toward];
                if (i + _pos.x >= 0 && i + _pos.x < this.colNum && j + _pos.y >= 0 && j + _pos.y < this.rowNum) {
                    let __star = this.starArray[i + _pos.x][j + _pos.y];
                    if (__star && __star.colorNum == this.clickColorNum) {
                        if (this.canUseStar(__star)) {
                            __star.mouseMove();
                        }
                    }
                }

            }
        }
        this.timer = 0;
        if (this.clickMoveTo > 1) {
            let s = UserData.numForScore(this.clickMoveTo);
            this.gainTip.string = this.clickMoveTo + "连消" + s + "分";
        }
        else {
            this.gainTip.string = " ";
        }
    }
    mouseUp(event) {
        this.userCanAction = false;
        this.isCheckAD = false;
        this.doubleScore = 0;
        if (this.firstStar == null || this.clickMoveTo <= 0) {
            this.userCanAction = true;
            return;
        }
        // 取消所有连线和连线的方块
        for (let i = 0; i < this.clickMoveTo - 1; i++) {
            this._linePool.put(this.lineArray[i]);
            this.starArrayTem[i].clearThisLine();
        }
        this.firstStar.clearThisLine();
        this.firstStar = null;
        // 可消除
        if (this.clickMoveTo >= this.clearStarNum) {
            if (UserData.newbie) {
                this.starArray[3][4].node.setParent(this.starNode);
                this.starArray[3][3].node.setParent(this.starNode);
                this.starArray[4][4].node.setParent(this.starNode);
                this.starArray[4][5].node.setParent(this.starNode);
            }
            this.newbied();
            UserData.playClearNum++;
            if (UserData.playClearNum == 1) {
                UserData.saveLog("war clear star number", [1]);
            }
            else if (UserData.playClearNum == 3) {
                UserData.saveLog("war clear star number", [3]);
            }
            let firPos = new cc.Vec2(0, 0);
            for (let i = 0; i < this.clickMoveTo; i++) {
                let k = this.clickStarArray[i].x;
                let j = this.clickStarArray[i].y;
                let pos = this.getPos(k, j);
                if (i == 0) {
                    firPos = pos;
                }
                this.starEffect.InitEffect(pos, this.clickColorNum);
                if (this.starArray[k][j]) {
                    this._starPool.put(this.starArray[k][j].node);
                    this.starArray[k][j] = null;
                }
            }

            cc.audioEngine.play(this.menuAudio[4], false, 1);
            if (this.clickMoveTo >= 5) {
                let ind = 0;
                if (this.clickMoveTo >= 8) {
                    this.isCheckAD = true;
                }
                if (this.clickMoveTo >= 10) {
                    ind = 2;
                }
                else if (this.clickMoveTo >= 8) {
                    ind = 1;
                }
                this.goodAni[ind].play();
                cc.audioEngine.play(this.goodAudio[ind], false, 1);
            }
            this.scorGet(this.clickMoveTo, firPos);
            this.userCanAction = false;
            this.initMove = 2;
            this.haveMoveIndex = 0;
            this.movieDown();
        }
        else {
            this.moveOver();
        }
        // 还原透明度
        for (let i = 0; i < this.colNum; i++) {
            for (let j = 0; j < this.rowNum; j++) {
                if (this.starArray[i][j] != null) {
                    this.starArray[i][j].node.opacity = 255;
                }
            }
        }
        this.clickColorNum = -1;
        this.clickMoveTo = 0;
        this.timer = 0;
    }
    private isCheckAD: boolean = false;
    private doubleScore: number = 0;
    moveOver() {
        if (this.isCheckAD) {
            let adNode = 0;
            if (Math.random() * 10 <= 3) {
                if (Math.random() < 0.5) {
                    adNode = 1
                }
                else {
                    adNode = 2;
                }
            }
            if (adNode > 0) {
                if (adNode == 1 && !AdManager.usable) {
                    adNode = 2;
                }
                // 显示分享界面
                switch (adNode) {
                    case 1:
                        this.doubleScore *= 4;
                        this.doubleAdNode.active = true;
                        for (let i = this.double3.length - 1; i >= 0; i--) {
                            this.double3[i].active = false;
                        }
                        for (let i = this.double4.length - 1; i >= 0; i--) {
                            this.double3[i].active = true;
                        }
                        this.doubleAdDouble.active = true;
                        this.doubleResult.active = false;
                        break;
                    case 2:
                        this.doubleScore *= 4;
                        this.doubleAdNode.active = true;
                        for (let i = this.double3.length - 1; i >= 0; i--) {
                            this.double3[i].active = true;
                        }
                        for (let i = this.double4.length - 1; i >= 0; i--) {
                            this.double3[i].active = false;
                        }
                        this.doubleAdDouble.active = true;
                        this.doubleResult.active = false;
                        break;
                }
                this.doubleScore = Math.floor(this.doubleScore);
            }
            else {
                this.moveOver2();
            }
        }
        else {
            this.moveOver2();
        }
    }
    moveOver2(): void {
        this.isCheckAD = false;
        if (!this.winFailJudge()) {
            this.canClickBtn = false;
            this.userCanAction = false;
            this.scheduleOnce(() => { this.judgeOver(); }, 1);
        }
        else {
            this.userCanAction = true;
            this.canClickBtn = true;
        }
    }

    // 当前鼠标在那个点上
    getMouseOverPoint(worldPoint): Stars {
        for (let i = 0; i < this.colNum; i++) {
            for (let j = 0; j < this.rowNum; j++) {
                if (this.starArray[i][j] != null) {
                    let nodePos = this.starNode.convertToWorldSpace(this.starArray[i][j].node.position);
                    if (Math.abs(nodePos.x - worldPoint.x) < 36 && Math.abs(nodePos.y - worldPoint.y) < 36) {
                        return this.starArray[i][j];
                    }
                }
            }
        }
        return null;
    }


    /** 是否无可消除的判断 */
    private winFailJudge(): boolean {
        for (let i = 0; i < this.colNum; i++) {
            for (let j = 0; j < this.rowNum; j++) {
                let _star = this.starArray[i][j];
                if (_star == null) continue;
                let starNum = 0;
                for (let k = 0; k < 8; k++) {
                    let _pos = this._arr[k];
                    if (i + _pos.x >= 0 && i + _pos.x < this.colNum && j + _pos.y >= 0 && j + _pos.y < this.rowNum) {
                        let __star = this.starArray[i + _pos.x][j + _pos.y];
                        if (__star && __star.colorNum == _star.colorNum) {
                            starNum++;
                            if (starNum >= this.clearStarNum - 1) return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    /** 显示提示 */
    private showLineTip(): void {
        if (UserData.newbie) return;
        if (this.firstStar != null) return;
        this.showTipArray = [];
        let _len = 0;
        for (let i = 0; i < this.colNum; i++) {
            for (let j = 0; j < this.rowNum; j++) {
                let _star = this.starArray[i][j];
                if (_star) {
                    let starNum = 0;
                    for (let k = 0; k < 8; k++) {
                        let _pos = this._arr[k];
                        if (i + _pos.x >= 0 && i + _pos.x < this.colNum && j + _pos.y >= 0 && j + _pos.y < this.rowNum) {
                            let __star = this.starArray[i + _pos.x][j + _pos.y];
                            if (__star && __star.colorNum == _star.colorNum) {
                                starNum++;
                                if (starNum >= this.clearStarNum - 1) {
                                    this.showTipArray[_len] = [];
                                    this.showTipArray[_len].push(_star);
                                    _len++;
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        if (_len > 0) {
            let search = this.traversal(this.showTipArray[Math.floor(Math.random() * _len)][0]);
            let posMove: cc.Vec2[] = []
            for (let i = 0; i < search.length; i++) {
                search[i].showTip();
                if (i < 2) {
                    posMove.push(search[i].node.position);
                }
            }
            this.tipHander.moveToNewPos(posMove);
        }
    }

    private traversal(_star: Stars) {
        let search: Stars[] = [];
        search.push(_star);
        this.initTraverArray();
        let index = 0;
        while (index < search.length) {
            let __star222 = search[index];
            for (let k = 0; k < 8; k++) {
                let search2 = this.searchLines(__star222, this._arr[k]);
                if (search2 != null) {
                    search.push(search2);
                }
            }
            index++;
        }
        return search;
    }
    private traverArray = [];
    private initTraverArray() {
        this.traverArray = new Array(this.colNum);
        for (let i = 0; i < this.rowNum; i++) {
            this.traverArray[i] = new Array(this.rowNum);
        }
        for (let i = 0; i < this.colNum; i++) {
            for (let j = 0; j < this.rowNum; j++) {
                this.traverArray[i][j] = 0;
            }
        }
    }
    private searchLines(_star: Stars, _pos) {
        let nexI = _star.indexOf.x + _pos.x;
        let nexJ = _star.indexOf.y + _pos.y;
        if (nexI >= 0 && nexI < this.colNum && nexJ >= 0 && nexJ < this.rowNum) {
            let __star = this.starArray[nexI][nexJ];
            if (__star && this.traverArray[nexI][nexJ] == 0 && __star.colorNum == _star.colorNum) {
                this.traverArray[nexI][nexJ] = 1;
                return __star;
            }
        }
        return null;
    }

    start() {
        this.init();
        this.gameOverToClearStar = 0;
    }
    // 进入结束清除剩余星星时刻
    gameOverToClearStar: number = 0;
    gameOverClearTime: number = 0;
    gameOverRemainNum: number = 0;

    update(dt) {
        AdManager.updates(dt);
        if (this.curScoreTem < UserData.score) {
            let add = Math.floor((UserData.score - this.curScoreTem) / 10);
            this.curScoreTem += add > 0 ? add : 1;
            if (this.curScoreTem > UserData.score) {
                this.curScoreTem = UserData.score;
            }
            this.curScore.string = this.curScoreTem.toString();
        }
        if (this.gameOverToClearStar == 1 || this.gameOverToClearStar == 2) {
            if (this.gameOverToClearStar == 1) {
                if (this.gameOverClearTime % 25 == 0 || this.gameOverRemainNum >= 5) {
                    let _break = false;
                    for (let i = this.colNum - 1; i >= 0; i--) {
                        if (_break) break;
                        for (let j = this.rowNum - 1; j >= 0; j--) {
                            if (this.starArray[i][j] != null) {
                                this.gameOverRemainNum++;
                                let pos = this.getPos(i, j);
                                this.starEffect.InitEffect(pos, this.starArray[i][j].colorNum);
                                this._starPool.put(this.starArray[i][j].node);
                                this.starArray[i][j] = null;
                                cc.audioEngine.play(this.menuAudio[4], false, 1);
                                if (this.gameOverRemainNum < 5) {
                                    _break = true;
                                }
                                let remScore = this.remainScore(this.gameOverRemainNum);
                                this.rewardTip.string = "奖励 " + remScore;
                                break;
                            }
                            if (i == 0 && j == 0) {
                                let remScore = this.remainScore(this.gameOverRemainNum);
                                if (remScore > 0) {
                                    UserData.score += remScore;
                                }
                                if (UserData.passScore <= UserData.score) {
                                    cc.audioEngine.play(this.menuAudio[2], false, 1);
                                }
                                else {
                                    cc.audioEngine.play(this.menuAudio[1], false, 1);
                                }
                                this.gameOverClearTime = 0;
                                this.gameOverToClearStar = 2;
                            }
                        }
                    }
                }
            }
            else {
                if (this.gameOverClearTime % 200 == 0) {
                    this.gameOverToClearStar = 3;
                    this.clearRemainOver();
                }
            }
            this.gameOverClearTime++;
            return;
        }
        if (this.timer > this.starDuration) {
            this.showLineTip();
            this.timer = -99999999;
            return;
        }
        this.timer += dt;
    }

    init() {
        this.canClickBtn = false;
        this.haveMoveIndex = 0;
        this.newbieNode.active = true;
        this.timer = -1;
        this.clearClick();
        this.curScoreTem = UserData.score;
        this.curScore.string = UserData.score.toString();
        this.passTip.active = false;
        this.lv.string = UserData.lvNum.toString();
        this.targetScore.string = UserData.passScore.toString();
        this.gainTip.string = " ";

        for (let i = 0; i < this.colNum; i++) {
            for (let j = 0; j < this.rowNum; j++) {
                if (this.starArray[i][j] != null) {
                    this._starPool.put(this.starArray[i][j].node);
                }
                let pos = this.getPos(i, j);
                let num = Math.floor(Math.random() * this.maxStarNum);
                if (UserData.newbie) {
                    if (i == 3) {
                        if (j == 3 || j == 4) {
                            num = 4;
                        }
                    }
                    if (i == 4) {
                        if (j == 4 || j == 5) {
                            num = 4;
                        }
                    }
                }
                this.starArray[i][j] = this.createNewStar(num, pos.x, pos.y + 3000).getComponent('Stars');
                this.starArray[i][j].init(num, i, j, this);
            }
        }
        this.startTipIndex = 0;
        this.startTipLabel[0].string = "关卡：" + UserData.lvNum.toString();
        this.startTipLabel[1].string = "目标：" + UserData.passScore.toString();
        this.showLvTip();
    }

    @property([cc.Animation])
    startTipAni: cc.Animation[] = [];
    @property([cc.Label])
    startTipLabel: cc.Label[] = [];
    startTipIndex: number = 0;
    @property(cc.Node)
    newbieNode: cc.Node = null;
    @property(cc.Node)
    newbieParent: cc.Node = null;
    @property(Hander)
    tipHander: Hander = null;

    private newbied() {
        if (UserData.newbie) {
            UserData.saveLog("newbie complete");
            this.newbieNode.opacity = 0;
            this.tipHander.hideThis();
            UserData.newbie = false;
            this.newbieNode.active = false;
        }
    }

    // 显示关卡提示
    public showLvTip() {
        if (this.startTipIndex < 2) {
            this.startTipAni[this.startTipIndex].node.x = 800;
            this.startTipAni[this.startTipIndex].node.active = true;
            this.startTipAni[this.startTipIndex].play();
            this.startTipIndex++;
        }
        else {
            for (let i = 0; i < 2; i++) {
                this.startTipAni[i].node.active = false;
            }
            cc.audioEngine.play(this.menuAudio[0], false, 1);
            this.starMove = true;
            this.initMove = 1;
            for (let i = 0; i < this.colNum; i++) {
                for (let j = 0; j < this.rowNum; j++) {
                    this.starArray[i][j].init(this.starArray[i][j].colorNum, i, j, this)
                    let pos = this.getPos(i, j);
                    let delay = 0;
                    if (i % 2 == 0) {
                        delay = 0.05 * j;
                    }
                    else {
                        delay = 0.05 * j + 0.15;
                    }
                    this.starArray[i][j].moveToNewPos(pos, delay);
                }
            }
        }
    }
    haveMoveIndex: number = 0;
    starMove: boolean = true;
    private initMove: number = 0;
    public canStartGame() {
        switch (this.initMove) {
            case 1:
                {
                    // 初始化的移动
                    if (this.starMove) {
                        this.haveMoveIndex++;
                        if (this.haveMoveIndex == this.rowNum * this.colNum) {
                            this.canClickBtn = true;
                            this.starMove = false;
                            this.initMove = 0;
                            this.userCanAction = true;
                            if (UserData.newbie) {
                                this.starArray[3][4].node.setParent(this.newbieParent);
                                this.starArray[3][3].node.setParent(this.newbieParent);
                                this.starArray[4][4].node.setParent(this.newbieParent);
                                this.starArray[4][5].node.setParent(this.newbieParent);
                                this.newbieNode.opacity = 255;
                                this.tipHander.moveToNewPos([this.starArray[4][5].node.position, this.starArray[4][4].node.position, this.starArray[3][4].node.position, this.starArray[3][3].node.position]);
                            }
                            else {
                                this.newbieNode.active = false;
                            }
                        }
                    }
                }
                break;
            case 2:
                {
                    this.haveMoveIndex++;
                    // 向下移动结束
                    if (this._moveDownNum == this.haveMoveIndex) {
                        // 向下移动结束
                        this.haveMoveIndex = 0;
                        this.initMove = 3;
                        this.movieLeft();

                    }
                }
                break;
            case 3:
                {
                    this.haveMoveIndex++;
                    // 向左移动结束
                    if (this._moveLeftNum == this.haveMoveIndex) {
                        // 向左移动结束
                        this.haveMoveIndex = 0;
                        this.initMove = 0;
                        this.moveOver();

                    }
                }
                break;
        }
    }

    // 初始化数据
    clearClick() {
        this.clickColorNum = -1;
        this.clickMoveTo = 0;
        this.firstStar = null;
        for (let i = 0; i < 100; i++) {
            this.clickStarArray[i] = new cc.Vec2(-1, -1);
            this.lineArray[i] = null;
            this.starArrayTem[i] = null;
        }
    }

    // 获得位置坐标
    getPos(i: number, j: number) {
        return cc.v2(-320 + 90 * i, -320 + 90 * j);
    }

    // 创建星星
    createNewStar(num: number, x: number, y: number) {
        let star = null;
        if (this._starPool.size() > 0) {
            star = this._starPool.get();
        }
        else {
            star = cc.instantiate(this.starPrefab);
        }
        this.starNode.addChild(star);
        star.setPosition(x, y);
        return star;
    }

    // 创建连线
    createLine(posX: number, posY: number, posX2: number, posY2: number) {
        let lin = null;
        if (this._linePool.size() > 0) {
            lin = this._linePool.get();
        }
        else {
            lin = cc.instantiate(this.linePrefab);
        }
        this.lineNode.addChild(lin);
        lin.setPosition(posX, posY);

        let x = posX2 - posX;
        let y = posY2 - posY;
        let hypotenuse = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        let cos = x / hypotenuse;
        let radian = Math.acos(cos);
        let angle = Math.floor(180 / (Math.PI / radian));
        if (y < 0) {
            angle = -angle;
        }
        lin.angle = angle;
        return lin;
    }
    // 画线
    toCreatLine(curStar: Stars) {
        cc.audioEngine.play(this.menuAudio[3], false, 1);
        this.starArrayTem[this.clickMoveTo - 2] = curStar;
        let pos = this.getPos(this.clickStarArray[this.clickMoveTo - 2].x, this.clickStarArray[this.clickMoveTo - 2].y);
        let pos2 = this.getPos(this.clickStarArray[this.clickMoveTo - 1].x, this.clickStarArray[this.clickMoveTo - 1].y);
        this.lineArray[this.clickMoveTo - 2] = this.createLine(pos.x, pos.y, pos2.x, pos2.y);
    }
    // 回退
    toRetrunLine() {
        cc.audioEngine.play(this.menuAudio[3], false, 1);
        this._linePool.put(this.lineArray[this.clickMoveTo - 2]);
        this.clickStarArray[this.clickMoveTo] = cc.v2(-1, -1);
        this.clickMoveTo--;
    }

    // 判断能否连上
    judgeCanLine(i: number, j: number) {
        let nexI = 0;
        let nexJ = 0
        if (this.clickMoveTo == 1) {
            nexI = this.firstStar.indexOf.x;
            nexJ = this.firstStar.indexOf.y;
        }
        else {
            nexI = this.starArrayTem[this.clickMoveTo - 2].indexOf.x;
            nexJ = this.starArrayTem[this.clickMoveTo - 2].indexOf.y;
        }
        if (Math.abs(i - nexI) <= 1 && Math.abs(j - nexJ) <= 1) {
            return true;
        }
        return false;
    }
    // 搜索相同颜色的方块
    searchCanLine(firstStar: Stars) {
        this.firstStar = firstStar;
        // 其他颜色的方块透明度变暗
        var starArray = this.starArray;
        for (let i = 0; i < this.colNum; i++) {
            for (let j = 0; j < this.rowNum; j++) {
                if (starArray[i][j] != null) {
                    let starClass = starArray[i][j];
                    starClass.closeTip();
                    if (this.clickColorNum != starClass.colorNum) {
                        starClass.node.opacity = 150;
                    }
                    else {
                        starClass.node.opacity = 255;
                    }
                }
            }
        }
    }

    judgeOver() {
        this.gameOverToClearStar = 1;
        this.gameOverClearTime = 0;
        this.timer = -99999999;
        let remain = 0;
        for (let i = this.colNum - 1; i >= 0; i--) {
            for (let j = this.rowNum - 1; j >= 0; j--) {
                if (this.starArray[i][j] != null) {
                    remain++;
                }
            }
        }
        this.rewardTip.string = "奖励 1000";
        this.rewardTip2.string = "剩余" + remain + "个星星";
        if (remain <= 4) {
            this.rewardAni.play();
        }
        this.rewardMenu.active = true;
    }
    /** 失败界面数据更新 */
    private showFailedInf() {
        this.failCurScore.string = UserData.score.toString();
        this.failPreScore.string = "历史最高分：" + UserData.bestScore;
        UserData.refrushFailMessageUp();
    }

    clearRemainOver() {
        this.canClickBtn = true;
        this.rewardMenu.active = false;
        this.passTip.active = false;
        this.gameOverRemainNum = 0;
        // 计算是否通关
        if (UserData.passScore <= UserData.score) {
            UserData.lvNum++;
            UserData.save();
            this.init();
        }
        else {
            UserData.save();
            this.showFailedInf();
            this.failMenu.active = true;
            if (AdManager.usable) {
                this.failMenuADBtn.active = true;
                this.failMenuBkBtn.x = -164;
            }
            else {
                this.failMenuADBtn.active = false;
                this.failMenuBkBtn.x = 0;
            }
        }
    }

    remainScore(remainNum: number) {
        remainNum = Math.floor(remainNum);
        if (remainNum >= 5) {
            return 0;
        }
        if (remainNum < 0) remainNum = 0;
        switch (remainNum) {
            case 0:
                return 1000;
            case 1:
                return 900;
            case 2:
                return 750;
            case 3:
                return 500;
            case 4:
                return 150;
            case 5:
                return 0;
        }
        return 0;
    }

    scorGet(num: number, pos: cc.Vec2) {
        let s = UserData.numForScore(num);
        this.doubleScore = s;
        UserData.score += s;
        this.gainTip.string = num + "连消" + s + "分";
        this.scoreTip(s, pos);
        if (UserData.passScore <= UserData.score) {
            if (!this.passTip.active) {
                this.passAni.play();
            }
            this.passTip.active = true;
        }
    }

    scoreTip(num: number, pos: cc.Vec2) {
        let score = null;
        if (this._scoreTipPool.size() > 0) {
            score = this._scoreTipPool.get();
        }
        else {
            score = cc.instantiate(this.scoreTipPrefab);
        }
        this.starNode.addChild(score);
        score.setPosition(pos);
        score.getComponent(cc.Label).string = num.toString();
        score.getComponent(cc.Animation).play();
    }

    // 向左移动的数量
    private _moveLeftNum: number = 0;
    // 向左移动
    movieLeft() {
        var starArray = this.starArray;
        for (let i = this.rowNum - 1; i >= 0; i--) {
            let empty = true;
            for (let j = this.colNum - 1; j >= 0; j--) {
                if (starArray[i][j] != null) {
                    empty = false;
                    break;
                }
            }
            if (empty) {
                starArray.splice(i, 1);
                let _arr = [];
                for (let j = this.colNum - 1; j >= 0; j--) {
                    _arr.push(null);
                }
                starArray.push(_arr);
            }
        }
        this._moveLeftNum = 0;
        for (let i = 0; i < this.rowNum; i++) {
            for (let j = this.colNum - 1; j >= 0; j--) {
                if (starArray[i][j] != null) {
                    if (starArray[i][j].init(starArray[i][j].colorNum, i, j, this)) {
                        this._moveLeftNum++;
                        let pos = this.getPos(i, j);
                        starArray[i][j].moveToNewPos(pos);
                    }
                }
            }
        }
        if (this._moveLeftNum == 0) {
            this.initMove = 0;
            this.haveMoveIndex = 0;
            this.moveOver();
        }
    }
    // 向下移动的数量
    private _moveDownNum: number = 0;
    // 向下移动
    movieDown() {
        var starArray = this.starArray;
        for (let i = 0; i < this.rowNum; i++) {
            for (let j = this.colNum - 1; j >= 0; j--) {
                if (starArray[i][j] == null) {
                    starArray[i].splice(j, 1);
                    starArray[i].push(null);
                }
            }
        }
        this._moveDownNum = 0;
        for (let i = 0; i < this.rowNum; i++) {
            for (let j = this.colNum - 1; j >= 0; j--) {
                if (starArray[i][j] != null) {
                    if (starArray[i][j].init(starArray[i][j].colorNum, i, j, this)) {
                        this._moveDownNum++;
                        let pos = this.getPos(i, j);
                        starArray[i][j].moveToNewPos(pos);
                    }
                }
            }
        }
        if (this._moveDownNum == 0) {
            this.haveMoveIndex = 0;
            this.initMove = 3;
            this.movieLeft();
        }
    }

}
