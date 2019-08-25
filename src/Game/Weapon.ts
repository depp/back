import { Vec, Box } from "./Math";
import { GameObject, IMovable, GameEvent, ObjectPool, IKiller } from "./GameEngine";

export class Weapon extends ObjectPool {

    protected time = 0;
    public children: Bullet[];

    constructor(
        protected factory: () => GameObject,
        public spd: number,
        public ammo: number,
        public magazine: number = 0
    ) {
        super(factory);
    }

    load(ammo: number) {
        this.ammo += ammo;
        if (this.magazine && this.ammo > this.magazine) {
            this.ammo = this.magazine;
        }
    }

    create(init: (item: GameObject) => void = null): GameObject {
        if (this.ammo <= 0 || (this.spd && this.time)) {
            return null;
        }
        this.ammo--;
        this.time = this.spd;
        return super.create(init);
    }

    update(delta: number) {
        this.time = delta < this.time ? this.time - delta : 0;
        super.update(delta);
    }
}

export class Bullet extends GameObject implements IMovable, IKiller {

    pos = new Vec();
    dir = new Vec();
    box = new Box(this.pos, this.size);

    constructor(
        public spd: number,
        public dmg: number,
        public size: number,
        public color: string
    ) {
        super();
    }

    render(ctx: CanvasRenderingContext2D) {
        const pos = this.box.center;
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, this.size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    update(delta: number) {
        this.pos.add(this.dir.clone().scale(this.spd * delta));
    }

}

export class Grenade extends Bullet {

    aim = new Vec();

    constructor(
        public spd: number,
        public dmg: number,
        public size: number,
        public radius: number
    ) {
        super(spd, dmg, size, "#0f0");
    }

    update(delta: number) {
        if (this.box.center.sub(this.aim).length <= this.spd * delta) {
            this.pos.set(this.aim);
            this.emit(new GameEvent("explode", this));
            this.parent.removeChild(this);
        } else {
            super.update(delta);
        }
    }
}