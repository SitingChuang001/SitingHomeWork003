import { _decorator, BoxCollider2D, Component, Contact2DType, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PipeView')
export class PipeView extends Component {
    @property({ type: Number })
    public maxSize: number = 3
    @property(BoxCollider2D)
    private collider: BoxCollider2D = null

    public get curState(): PipeState {
        return this.ballCount < this.maxSize ? PipeState.Open : PipeState.Close
    }
    public startPos: Vec3
    public endPos: Vec3
    public ballCount:number = 0
    public get moveApprove(): boolean {
        return this._moveApprove
    }
    private _moveApprove: boolean = true

    protected onLoad(): void {
        const pos = this.node.getPosition()
        const height = this.node.getComponent(UITransform).height
        this.startPos = new Vec3(pos.x, pos.y -    height / 2, pos.z)
        this.endPos = new Vec3(pos.x, pos.y + height / 2, pos.z)
        this.collider.on(Contact2DType.BEGIN_CONTACT, this.onMidleContact, this)
    }

    private onMidleContact(): void {
       this._moveApprove = true
    }


    public setMoveApprove(value: boolean): void {
        this._moveApprove = value
    }
}

export enum PipeState {
    Open,
    Close
}

