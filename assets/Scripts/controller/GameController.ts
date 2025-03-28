import { _decorator, Component, instantiate, Node, NodePool, PhysicsSystem2D, Prefab, randomRange, randomRangeInt, UITransform, Vec3 } from 'cc';
import { PipeState, PipeView } from '../view/PipeView';
import { BallState, BallView } from '../view/BallView';
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

    @property(Node)
    private endNode: Node = null

    private ballQueue: BallView[] = []
    private ballPool: NodePool = new NodePool
    private endPos: Vec3 = new Vec3

    onLoad() {
        PhysicsSystem2D.instance.enable = true
        this.endPos = this.endNode.getWorldPosition()
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
        this.ballQueue.push(ball)
    }

    private reCycleBall(ball: BallView) {
        this.ballPool.put(ball.node)
    }

    protected update(dt: number): void {
        const toRemove: BallView[] = []
        this.ballQueue.forEach((ball) => {
            switch (ball.curState) {
                case BallState.WAITING:
                    const curPipe = ball.curPipe
                    let nextPipe: PipeView
                    let pos: Vec3
                    let ballState: BallState
                    let ballNextState: BallState
                    if (curPipe === null) {
                        if (this.pipeA.curState === PipeState.Open) {
                            nextPipe = this.pipeA
                            this.pipeA.ballCount++
                            ball.moveTo(this.pipeA.startPos, BallState.MOVE_INTO_PIPE, BallState.MOVE_INTO_PIPE_COMPLETE, nextPipe)
                        }
                    }
                    if (curPipe === this.pipeA) {
                        if (this.pipeB1.curState === PipeState.Open) {
                            nextPipe = this.pipeB1
                            this.pipeB1.ballCount++
                            this.pipeA.ballCount--
                            ball.moveTo(this.pipeB1.startPos, BallState.MOVE_INTO_PIPE, BallState.MOVE_INTO_PIPE_COMPLETE, nextPipe)
                        }
                        else if (this.pipeB2.curState === PipeState.Open) {
                            nextPipe = this.pipeB2
                            this.pipeB2.ballCount++
                            this.pipeA.ballCount--
                            ball.moveTo(this.pipeB2.startPos, BallState.MOVE_INTO_PIPE, BallState.MOVE_INTO_PIPE_COMPLETE, nextPipe)
                        }
                    }
                    else if (curPipe === this.pipeB1 || curPipe === this.pipeB2) {
                        if (this.pipeC.curState === PipeState.Open) {
                            nextPipe = this.pipeC
                            this.pipeC.ballCount++
                            curPipe.ballCount --
                            ball.moveTo(this.pipeC.startPos, BallState.MOVE_INTO_PIPE, BallState.MOVE_INTO_PIPE_COMPLETE, nextPipe)
                        }
                    } else if (curPipe === this.pipeC) {
                        nextPipe = null
                        curPipe.ballCount--
                        ball.moveTo(this.endPos, BallState.MOVE_INTO_END, BallState.END, nextPipe)
                    } // 原有的pipe要減1，新的pipe的queue要加1 並更改球的curPipe
                    // curPipe.queue-1
                    // nextPipe?.queue-1
                    // ball.moveTo(pos, ballState, ballNextState, nextPipe)
                    break
                case BallState.MOVE_INTO_PIPE_COMPLETE:
                    ball.moveTo(ball.curPipe.endPos, BallState.MOVE_ON_PIPE, BallState.WAITING, ball.curPipe)
                    break
                case BallState.MOVE_INTO_PIPE:
                case BallState.MOVE_INTO_END:
                case BallState.MOVE_ON_PIPE:
                    break
                case BallState.END:
                    this.reCycleBall(ball)
                    toRemove.push(ball)
                    break
            }
        })
        this.ballQueue = this.ballQueue.filter(ball => !toRemove.includes(ball))
    }
}

