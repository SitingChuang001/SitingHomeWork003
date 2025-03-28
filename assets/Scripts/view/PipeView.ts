import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
import { BallView } from './BallView';
import { BlockState, BlockView } from './BlockView';
const { ccclass, property } = _decorator;

@ccclass('PipeView')
export class PipeView extends Component {
    @property({ type: Number })
    public maxSize: number = 3

    public queue: BallView[] = []
    public curState: PipeState
    public startPos: Vec3
    public endPos: Vec3
    public ballCount:number = 0

    protected onLoad(): void {
        const pos = this.node.worldPosition
        const height = this.node.getComponent(UITransform).height
        this.startPos = new Vec3(pos.x, pos.y - height / 2, pos.z)
        this.endPos = new Vec3(pos.x, pos.y + height / 2, pos.z)
    }



    protected update(dt: number): void {
        if (this.ballCount < this.maxSize)
            this.curState = PipeState.Open
        else
            this.curState = PipeState.Close
    }
}

export enum PipeState {
    Open,
    Close
}

