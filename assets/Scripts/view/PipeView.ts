import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';
import { BallView } from './BallView';
const { ccclass, property } = _decorator;

@ccclass('PipeView')
export class PipeView extends Component {
    public queue: BallView[] = []
    public slots: Vec3[] = []
    @property({ type: Number })
    public maxSize: number = 3
    public get curState(): PipeState {
        if (this.queue.length < this.maxSize)
            return PipeState.Open
        else
            return PipeState.Close
    }
    public moveToNextPipe: (ball: BallView, pipe: PipeView) => {}

    public onLoad(): void {
        this.node.children.forEach((element) => {
            this.slots.push(element.worldPosition)
        })
    }

    public init(moveCb: (ball: BallView, pipe: PipeView) => {}) {
        this.moveToNextPipe = moveCb
    }

    public async tryEnter(ball: BallView) {
        this.queue.push(ball)
        const slotIndex = this.queue.length - 1
        await this.moveToPipeStartPos(ball)
        await this.repositionQueue()
        await this.moveOutFirstBall()
    }
    private moveToPipeStartPos(ball: BallView): Promise<void> {
        return new Promise(async (resolve) => {
            const pos = new Vec3(this.node.worldPosition.x, this.node.worldPosition.y - (this.node.getComponent(UITransform).height / 2), 0)
            await ball.moveTo(pos)
            resolve()
        })
    }
    private async moveOutFirstBall() {
        const ball = this.queue.shift();
        if (ball) {
            await this.moveToNextPipe(ball, this)
        }
        await this.repositionQueue()
    }
    private async repositionQueue(): Promise<void> {
        return new Promise((resolve) => {
            this.queue.forEach(async (ball, index) => {
                const targetSlot = this.slots[index]
                await ball.moveTo(targetSlot)
                if (index == this.queue.length - 1) {
                    console.log("Sitting")
                    resolve()
                }
            })
        })
    }

    private waitUntilSlotAvailable(): Promise<void> {
        return new Promise((resolve) => {
            const check = () => {
                if (this.queue.length < this.maxSize) {
                    resolve()
                } else {
                    setTimeout(check, 100)
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

