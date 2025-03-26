import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
import { BallView } from './BallView';
import { BlockState, BlockView } from './BlockView';
const { ccclass, property } = _decorator;

@ccclass('PipeView')
export class PipeView extends Component {
    public queue: BallView[] = []
    private enteringQueue: BallView[] = []
    public slots: Vec3[] = []
    @property({ type: Number })
    public maxSize: number = 3
    public blocks: BlockView[] = []
    public get curState(): PipeState {
        if (this.queue.length < this.maxSize)
            return PipeState.Open
        else
            return PipeState.Close
    }
    public moveToNextPipe: (ball: BallView, pipe: PipeView) => {}

    public onLoad(): void {
        this.node.children.forEach((element, index) => {
            const block = element.getComponent(BlockView)
            block.init(this.moveToNextBlock.bind(this), index)
            this.blocks.push(block)
            this.slots.push(element.worldPosition)
        })
    }

    public init(moveCb: (ball: BallView, pipe: PipeView) => {}) {
        this.moveToNextPipe = moveCb
    }

    public moveToNextBlock(ball: BallView, id: number): Promise<void> {
        return new Promise(async (resolve) => {
            let index = id + 1
            if (index < this.blocks.length) {
                await this.waitAvailableNextBlock(this.blocks[index])
                this.blocks[index].moveInBall(ball)
                resolve()
            } else {
                this.queue.shift()
                this.moveToNextPipe(ball, this)
                resolve()
            }
        })
    }

    public async tryEnter(ball: BallView) {
        this.queue.push(ball)
        await this.moveToNextBlock(ball, -1)
    }

    private moveToPipeStartPos(ball: BallView): Promise<void> {
        return new Promise(async (resolve) => {
            const pos = new Vec3(this.node.worldPosition.x, this.node.worldPosition.y - (this.node.getComponent(UITransform).height / 2), 0)
            await ball.moveTo(pos)
            resolve()
        })
    }

    public waitAvailableNextBlock(block: BlockView): Promise<void> {
        return new Promise((resolve) => {
            const check = () => {
                if (block.curState === BlockState.Empty) {
                    resolve()
                } else {
                    setTimeout(check, 10)
                }
            }
            check()
        })

    }
}

export enum PipeState {
    Open,
    Close
}

