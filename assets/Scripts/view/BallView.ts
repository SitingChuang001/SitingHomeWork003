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

    protected onLoad(): void {
        this.curSpeed = this.defaultSpeed
    }
    public init(num: number) {
        this.numberLabel.string = `${num}`
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

