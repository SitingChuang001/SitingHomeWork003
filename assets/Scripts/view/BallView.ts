import { _decorator, Component, Label, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BallView')
export class BallView extends Component {
    @property(Label)
    private numberLabel: Label

    public init(num: number) {
        this.numberLabel.string = `${num}`
    }

    public async moveTo(pos: Vec3, reCycleCb?: (ball: BallView) => {}): Promise<void> {
        return new Promise((resolve) => {
            tween(this.node)
                .to(0.5, { worldPosition: pos }, { easing: 'smooth' })
                .call(() => {
                    resolve()
                    if (reCycleCb)
                        reCycleCb(this)
                })
                .start()
        });
    }
}

