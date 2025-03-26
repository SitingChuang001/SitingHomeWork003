import { _decorator, Component } from 'cc';
import { BallView } from './BallView';
const { ccclass } = _decorator;

@ccclass('BlockView')
export class BlockView extends Component {
    public ballContent: BallView = null
    public blockId: number

    public get curState(): BlockState {
        return this.ballContent === null ? BlockState.Empty : BlockState.Full
    }
    public moveToNextBlock: (ball: BallView, id: number) => Promise<void> = async () => { }

    public init(moveCb: (ball: BallView, id: number) => Promise<void>, id: number) {
        this.moveToNextBlock = moveCb
        this.blockId = id
    }
    public async moveOutBall(ball: BallView) {
        await this.moveToNextBlock(ball, this.blockId)
        this.ballContent = null
    }
    public async moveInBall(ball: BallView) {
        this.ballContent = ball
        await ball.moveTo(this.node.worldPosition)
        this.moveOutBall(ball)
    }
}

export enum BlockState {
    Full,
    Empty
}

