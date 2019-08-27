import { Box, Vec } from "./Math";
import { Bullet, Grenade, Weapon } from "./Weapon";
import { IMovable, GameEvent, GameObject, IKillable } from "./GameEngine";
import { IConfig } from "../config";

export default class Hero extends GameObject implements IMovable, IKillable {

    hp: number;
    max: number;
    spd: number;
    score: number;
    pos: Vec;
    box: Box;
    dir = new Vec();
    aim = new Vec();
    fire = false;
    gun: Weapon;
    grenades: Weapon;

    constructor({x, y, hp, spd, score, gun, gnd}: IConfig = {}) {
        super();
        this.hp = hp;
        this.max = hp;
        this.spd = spd;
        this.score = score;
        this.pos = new Vec(x, y);
        this.box = new Box(this.pos, 16, 24);
        this.gun = new Weapon(() => new Bullet(gun.bul), gun);
        this.grenades = new Weapon(() => new Grenade(gnd.bul), gnd)
        this.addChild(this.grenades);
        this.addChild(this.gun);
    }

    render(ctx: CanvasRenderingContext2D) {
        super.render(ctx);
        const box = this.box;
        const pos = this.pos;
        ctx.save();
        ctx.fillStyle = "#00c";
        ctx.fillRect(pos.x, pos.y, box.width, box.height);
        ctx.restore();
    }

    update(delta: number) {
        super.update(delta);
        if (this.fire) {
            this.gun.create((bullet: Bullet) => {
                const box = bullet.box;
                const center = this.box.center;
                bullet.dir.set(this.aim.clone().sub(center).normalize());
                bullet.pos.set(center.sub(box.width / 2, box.height / 2));
                this.emit(new GameEvent("fire", this, bullet));
            });
        }
    }

    launch() {
        this.grenades.create((item: Grenade) => {
            const box = item.box;
            const center = this.box.center;
            item.dir.set(this.aim.clone().sub(center).normalize());
            item.pos.set(center.sub(box.width / 2, box.height / 2));
            item.aim.set(this.aim);
            this.emit(new GameEvent("launch"));
        });
    }

}
