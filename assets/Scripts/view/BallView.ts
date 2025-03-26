import { _decorator, Component, Label, Node, tween, Vec3 } from 'cc';
import { PipeView } from './PipeView';
const { ccclass, property } = _decorator;

@ccclass('BallView')
export class BallView extends Component {
    @property(Label)
    private numberLabel: Label

    public init(num: number) {
        this.numberLabel.string = `${num}`
    }

    public async moveTo(pos: Vec3, cb?: (ball: BallView) => {}): Promise<void> {
        return new Promise((resolve) => {
            tween(this.node)
                .to(0.5, { worldPosition: pos }, { easing: 'smooth' })
                .call(() => {
                    resolve()
                    if (cb)
                        cb(this)
                })
                .start()
        });
    }
}

