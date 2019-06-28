import WarManagers from "./WarManagers";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AniEvent extends cc.Component {

    @property(WarManagers)
    warmanger: WarManagers = null;
    aniOver(over) {
        if (this.warmanger) {
            this.warmanger.showLvTip();
        }
    }
}
