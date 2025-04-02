import { _decorator, Collider, Component, instantiate, Node, NodePool, PhysicsSystem2D, Prefab, randomRange, randomRangeInt, tween, UITransform, Vec3 } from 'cc';
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
    private ballNum: number = 1

    onLoad() {
        this.endPos = this.endNode.getWorldPosition()
        PhysicsSystem2D.instance.enable = true
    }

    public async spawnBall() {
        let ballNode: Node = null
        if (this.ballPool.size() > 0) {
            ballNode = this.ballPool.get()
        } else {
            ballNode = instantiate(this.ballPrefab)
        }
        const ball = ballNode.getComponent(BallView)
        ball.init(this.ballNum++)

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
                    if (curPipe === null) {
                        if (this.pipeA.curState === PipeState.Open) {
                            ball.setState(BallState.POOL_TO_PIPE_MOVING)
                            ball.setPipe(this.pipeA)
                            ball.setTargetPos(this.pipeA.startPos)
                            this.pipeA.ballCount++
                            tween(ball.node)
                                .to(1, { worldPosition: ball.targetPos }, { easing: "linear" })
                                .start()//初次進管子，避免順序亂掉，不用定速改用秒數
                        }
                    }
                    if (curPipe === this.pipeA) {
                        if (this.pipeB1.curState === PipeState.Open) {
                            ball.setState(BallState.PIPE_TO_PIPE_MOVING)
                            ball.setPipe(this.pipeB1)
                            ball.setTargetPos(this.pipeB1.startPos)
                            this.pipeB1.ballCount++
                            curPipe.ballCount--
                        }
                        else if (this.pipeB2.curState === PipeState.Open) {
                            ball.setState(BallState.PIPE_TO_PIPE_MOVING)
                            ball.setPipe(this.pipeB2)
                            ball.setTargetPos(this.pipeB2.startPos)
                            curPipe.ballCount--
                        }
                    }
                    else if (curPipe === this.pipeB1 || curPipe === this.pipeB2) {
                        if (this.pipeC.curState === PipeState.Open) {
                            ball.setState(BallState.PIPE_TO_PIPE_MOVING)
                            ball.setPipe(this.pipeC)
                            ball.setTargetPos(this.pipeC.startPos)
                            this.pipeC.ballCount++
                            curPipe.ballCount--
                        }
                    } else if (curPipe === this.pipeC) {
                        ball.setState(BallState.PIPE_TO_END_MOVING)
                        ball.setPipe(null)
                        ball.setTargetPos(this.endPos)
                        curPipe.ballCount--
                    }
                    break
                case BallState.ON_PIPE_START:
                    if (ball.curPipe.moveApprove) {
                        ball.setState(BallState.MOVE_ON_PIPE)
                        ball.setTargetPos(ball.curPipe.endPos)
                        ball.moveToNewState(ball.curPipe.endPos, BallState.MOVE_ON_PIPE, BallState.WAITING, ball.curPipe)
                        ball.curPipe.setMoveApprove(false)
                    }//判斷前一顆球會不會和自己重疊
                    break
                case BallState.POOL_TO_PIPE_MOVING:
                    const dirss = new Vec3()
                    Vec3.subtract(dirss, ball.targetPos, ball.node.worldPosition)
                    const distancess = Vec3.len(dirss)
                    if (distancess < 3) {
                        ball.setState(BallState.ON_PIPE_START)
                    }  
                    break
                case BallState.PIPE_TO_END_MOVING:
                case BallState.PIPE_TO_PIPE_MOVING:
                case BallState.MOVE_ON_PIPE:
                    if (!ball.targetPos || ball.curSpeed <= 0)
                        return

                    const currentPos = ball.node.worldPosition
                    const dir = new Vec3()
                    Vec3.subtract(dir, ball.targetPos, currentPos)
                    const distance = Vec3.len(dir)

                    const reachThreshold = 3

                    if (distance < reachThreshold) {
                        ball.node.setWorldPosition(ball.targetPos)
                        ball.targetPos = null
                        if(ball.curState === BallState.MOVE_ON_PIPE){
                            ball.setState(BallState.WAITING)
                        }else if (ball.curState === BallState.PIPE_TO_PIPE_MOVING) {
                            ball.setState(BallState.ON_PIPE_START)
                        }else if (ball.curState === BallState.PIPE_TO_END_MOVING) {
                            ball.setState(BallState.END)
                        }
                        return
                    }

                    Vec3.normalize(dir, dir)
                    const moveDelta = Vec3.multiplyScalar(new Vec3(), dir, ball.curSpeed * dt)
                    ball.node.setWorldPosition(Vec3.add(new Vec3(), currentPos, moveDelta))
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

