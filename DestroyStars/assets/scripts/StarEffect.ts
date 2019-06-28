
const { ccclass, property } = cc._decorator;

@ccclass
export default class StarEffect extends cc.Component {

    @property([cc.SpriteFrame])
    pic: cc.SpriteFrame[] = [];
    @property(cc.Prefab)
    prefabs: cc.Prefab = null;

    _pool: cc.NodePool = new cc.NodePool();

    onLoad() {
        // 初始化对象池
        for (let i = 0; i < 10; i++) {
            let star = cc.instantiate(this.prefabs);
            this._pool.put(star);
        }
    }
    // 生成图片
    public InitEffect(pos: cc.Vec2, colorNum: number) {
        let randomNum = Math.floor(Math.random() * 3 + 3);
        for (let i = 0; i < randomNum; i++) {
            let star: cc.Node = null;
            if (this._pool.size() > 0) {
                star = this._pool.get();
            }
            else {
                star = cc.instantiate(this.prefabs);
            }
            this.node.addChild(star);
            star.setPosition(pos);
            star.getComponent('StarEff').init(this, this.pic[colorNum], () => {
                star.active = false;
                this._pool.put(star);
            });
        }
    }


}
