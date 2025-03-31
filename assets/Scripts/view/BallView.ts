import { _decorator, CircleCollider2D, Component, Contact2DType, Label, Vec3 } from 'cc';
import { PipeView } from './PipeView';
const { ccclass, property } = _decorator;

@ccclass('BallView')
export class BallView extends Component {
    @property(Label)
    private numberLabel: Label
    @property
    public defaultSpeed: number = 300

    private curSpeed: number

    public curPipe: PipeView = null
    public curState: BallState = null
    public targetPos: Vec3
    private moveCallback: (() => void) | null = null

    protected onLoad(): void {
        this.curSpeed = this.defaultSpeed
    }
    public init(num: number) {
        this.numberLabel.string = `${num}`
        this.curState = BallState.WAITING
    }

    public moveToNewState(pos: Vec3, state: BallState, nextState: BallState, pipe?: PipeView) {
        this.targetPos = pos
        this.curState = state
        this.curPipe = pipe
        this.moveCallback = () => { this.curState = nextState }
    }

    protected update(dt: number): void {
        if (!this.targetPos || this.curSpeed <= 0)
            return

        const currentPos = this.node.worldPosition
        const dir = new Vec3()
        Vec3.subtract(dir, this.targetPos, currentPos)
        const distance = Vec3.len(dir)

        const reachThreshold = 3

        if (distance < reachThreshold) {
            this.node.setWorldPosition(this.targetPos)
            this.targetPos = null
            if (this.moveCallback) {
                this.moveCallback()
                this.moveCallback = null
            }
            return
        }

        Vec3.normalize(dir, dir)
        const moveDelta = Vec3.multiplyScalar(new Vec3(), dir, this.curSpeed * dt)
        this.node.setWorldPosition(Vec3.add(new Vec3(), currentPos, moveDelta))
    }
}

export enum BallState {
    WAITING,
    MOVE_INTO_PIPE,
    MOVE_INTO_PIPE_COMPLETE,
    MOVE_ON_PIPE,
    MOVE_INTO_END,
    END
}

