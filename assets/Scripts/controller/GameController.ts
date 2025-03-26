import { _decorator, Component, instantiate, Node, NodePool, Prefab, randomRange, randomRangeInt, UITransform, Vec3 } from 'cc';
import { PipeState, PipeView } from '../view/PipeView';
import { BallView } from '../view/BallView';
const { ccclass, property } = _decorator;

@ccclass('GameController')
export class GameController extends Component {
    @property(Prefab)
    private ballPrefab: Prefab = null

    @property(PipeView)
    private pipeA: PipeView = null
    @property(PipeView)
    private pipeB1: PipeView = null
    @property(PipeView)
    private pipeB2: PipeView = null
    @property(PipeView)
    private pipeC: PipeView = null

    private ballPool: NodePool = new NodePool

    onLoad() {
        this.initializePipes()
    }

    private initializePipes() {
        this.pipeA.init(this.goNextPipe.bind(this))
        this.pipeB1.init(this.goNextPipe.bind(this))
        this.pipeB2.init(this.goNextPipe.bind(this))
        this.pipeC.init(this.goNextPipe.bind(this))
    }

    public async spawnBall() {
        let ballNode: Node = null
        if (this.ballPool.size() > 0) {
            ballNode = this.ballPool.get()
        } else {
            ballNode = instantiate(this.ballPrefab)
        }
        const ball = ballNode.getComponent(BallView)
        ball.init(randomRangeInt(1, 20))

        const randomPos = new Vec3(
            randomRange(230, 530),
            randomRange(-150, 150),
            0
        )
        ballNode.setPosition(randomPos)
        this.node.addChild(ballNode)
        await this.goNextPipe(ball, null)
    }

    private reCycleBall(ball: BallView) {
        this.ballPool.put(ball.node)
    }

    public goNextPipe(ball: BallView, curPipe: PipeView): Promise<void> {
        return new Promise(async (resolve) => {
            let nextPipe: PipeView = null
            switch (curPipe) {
                case null:
                    nextPipe = this.pipeA
                    break
                case this.pipeA:
                    nextPipe = Math.random() > 0.5 ? this.pipeB1 : this.pipeB2
                    break
                case this.pipeB1:
                case this.pipeB2:
                    nextPipe = this.pipeC
                    break
                case this.pipeC:
                    ball.moveTo(new Vec3(ball.node.worldPosition.x, this.node.parent.getComponent(UITransform).height + 50, 0), this.reCycleBall.bind(this))
                    resolve()
                    return
            }
            await this.waitAvailableNextPipe(nextPipe)
            nextPipe.tryEnter(ball)
        })
    }

    public waitAvailableNextPipe(nextPipe: PipeView): Promise<void> {
        return new Promise((resolve) => {
            const check = () => {
                if (nextPipe.curState == PipeState.Open) {
                    resolve()
                } else {
                    setTimeout(check, 10)
                }
            }
            check()
        })

    }
}

