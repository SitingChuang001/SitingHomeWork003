import { _decorator,  Collider2D,  Component,  Label, Vec3 } from 'cc';
import { PipeView } from './PipeView';
const { ccclass, property } = _decorator;

@ccclass('BallView')
export class BallView extends Component {
    @property(Label)
    private numberLabel: Label
    @property
    public defaultSpeed: number = 300

    public curSpeed: number

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

    public setState(state:BallState){
        this.curState = state
    }
    public setSpeed(speed: number) {
        this.curSpeed = speed
    }
    public setPipe(pipe: PipeView) {
        this.curPipe = pipe
    }
    public setTargetPos(pos: Vec3) {
        this.targetPos = pos
    }

    public moveToNewState(pos: Vec3, state: BallState, nextState: BallState, pipe?: PipeView) {
        this.targetPos = pos
        this.curState = state
        this.curPipe = pipe
        this.moveCallback = () => { this.curState = nextState }
    }

    protected update(dt: number): void {
        // if (!this.targetPos || this.curSpeed <= 0)
        //     return

        // const currentPos = this.node.worldPosition
        // const dir = new Vec3()
        // Vec3.subtract(dir, this.targetPos, currentPos)
        // const distance = Vec3.len(dir)

        // const reachThreshold = 3

        // if (distance < reachThreshold) {
        //     this.node.setWorldPosition(this.targetPos)
        //     this.targetPos = null
        //     if (this.moveCallback) {
        //         this.moveCallback()
        //         this.moveCallback = null
        //     }
        //     return
        // }

        // Vec3.normalize(dir, dir)
        // const moveDelta = Vec3.multiplyScalar(new Vec3(), dir, this.curSpeed * dt)
        // this.node.setWorldPosition(Vec3.add(new Vec3(), currentPos, moveDelta))
    }
}

export enum BallState {
    WAITING,
    PIPE_TO_PIPE_MOVING,
    POOL_TO_PIPE_MOVING,
    PIPE_TO_END_MOVING,
    MOVE_ON_PIPE,
    ON_PIPE_START,
    END
}

