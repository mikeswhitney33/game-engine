class Input {
    static keys_down = new Object();
    static keys_pressed = new Object();
    static IsKeyDown(key) {
        return Input.keys_down[key] || false;
    }
    static IsKeyPressed(key) {
        return Input.keys_pressed[key] || false;
    }
    static IsKeyUp(key) {
        return !Input.IsKeyDown(key);
    }
}

class Vector2 {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    copy() {
        return new Vector2(this.x, this.y);
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}

function toRadians(deg) {
    return deg * Math.PI / 180.0;
}

class Matrix3 {
    constructor(a, b, c, d, e, f, g, h, i) {
        this.a = a || 1;
        this.b = b || 0;
        this.c = c || 0;
        this.d = d || 0;
        this.e = e || 1;
        this.f = f || 0;
        this.g = g || 0;
        this.h = h || 0;
        this.i = i || 1;
    }

    static Identity() {
        return new Matrix3();
    }

    static Translate(point) {
        return new Matrix3(1, 0, point.x, 0, 1, point.y, 0, 0, 1);
    }

    static Scale(point) {
        return new Matrix3(point.x, 0, 0, 0, point.y, 0, 0, 0, 1);
    }

    static Rotate(deg) {
        const cos = Math.cos(toRadians(deg));
        const sin = Math.sin(toRadians(deg));
        return new Matrix3(cos, sin, 0, -sin, cos, 0, 0, 0, 1);
    }

    static Transform(matrix, point, point_z) {
        let x = matrix.a * point.x + matrix.b * point.y + matrix.c * point_z;
        let y = matrix.d * point.x + matrix.e * point.y + matrix.f * point_z;
        const z = matrix.g * point.x + matrix.h * point.y + matrix.i * point_z;
        if (z != 0) {
            x /= z;
            y /= z;
        }
        return new Vector2(x, y);
    }

    static TransformPoint(matrix, point) {
        return Matrix3.Transform(matrix, point, 1);
    }

    static TransformVector(matrix, vector) {
        return Matrix3.Transform(matrix, vector, 0);
    }

    static Matmul(matrix1, matrix2) {
        return new Matrix3(
            matrix1.a * matrix2.a + matrix1.b * matrix2.d + matrix1.c * matrix2.g,
            matrix1.a * matrix2.b + matrix1.b * matrix2.e + matrix1.c * matrix2.h,
            matrix1.a * matrix2.c + matrix1.b * matrix2.f + matrix1.c * matrix2.i,

            matrix1.d * matrix2.a + matrix1.e * matrix2.d + matrix1.f * matrix2.g,
            matrix1.d * matrix2.b + matrix1.e * matrix2.e + matrix1.f * matrix2.h,
            matrix1.d * matrix2.c + matrix1.e * matrix2.f + matrix1.f * matrix2.i,

            matrix1.g * matrix2.a + matrix1.h * matrix2.d + matrix1.i * matrix2.g,
            matrix1.g * matrix2.b + matrix1.h * matrix2.e + matrix1.i * matrix2.h,
            matrix1.g * matrix2.c + matrix1.h * matrix2.f + matrix1.i * matrix2.i,
        )
    }

    toString() {
        return `[${this.a}\t${this.b}\t${this.c}]
[${this.d}\t${this.e}\t${this.f}]
[${this.g}\t${this.h}\t${this.i}]`;
    }
}


class Transform {
    constructor(translation, rotation, scale) {
        this.translation = translation;
        this.rotation = rotation;
        this.scale = scale;
    }

    get_matrix() {
        const translation = Matrix3.Translate(this.translation);
        const rotation = Matrix3.Rotate(this.rotation);
        const scale = Matrix3.Scale(this.scale);
        return Matrix3.Matmul(Matrix3.Matmul(translation, rotation), scale);
    }

    static Identity2() {
        return new Transform(new Vector2(0, 0), 0, new Vector2(1, 1));
    }
}

class Component {
    constructor() {

    }

    update(gameObject, delta_time) {}

    draw(ctx, current_matrix) {}
}

class RectangleSprite extends Component {
    constructor(fill_color, stroke_color, stroke_width) {
        super();
        this.fill_color = fill_color || "#FFFFFF";
        this.stroke_color = stroke_color || "#000000";
        this.stroke_width = stroke_width || 1;
    }

    draw(ctx, current_matrix) {
        const p0 = Matrix3.TransformPoint(current_matrix, new Vector2(0, 0));
        const p1 = Matrix3.TransformPoint(current_matrix, new Vector2(1, 0));
        const p2 = Matrix3.TransformPoint(current_matrix, new Vector2(1, 1));
        const p3 = Matrix3.TransformPoint(current_matrix, new Vector2(0, 1));

        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p0.x, p1.y);
        ctx.closePath();
        ctx.fillStyle = this.fill_color;
        ctx.strokeStyle = this.stroke_color;
        ctx.stroekWidth = this.stroke_width;
        ctx.stroke();
        ctx.fill();
    }
}

class GameObject {
    constructor(args) {
        this.name = args.name || "Untitled";
        this.transform = args.transform || Transform.Identity2();
        this.components = args.components || [];
        this.children = args.children || [];
        this.tag = args.tag || null;
    }

    update(delta_time) {
        for(const component of this.components) {
            component.update(this, delta_time);
        }
        for(const child of this.children) {
            child.update(delta_time);
        }
    }

    draw(ctx, current_matrix) {
        current_matrix = Matrix3.Matmul(current_matrix, this.transform.get_matrix());
        for(const component of this.components) {
            component.draw(ctx, current_matrix);
        }
        for(const child of this.children) {
            child.draw(ctx, current_matrix);
        }
    }
}

class Game {
    constructor(selector, args) {
        args = args || {};
        this.selector = selector;
        this.title = args.title || window.title;

        this.gameObjects = args.gameObjects || [];

        this.canvas = document.querySelector(selector);
        this.ctx = this.canvas.getContext(args.context || "2d");
        this.last_time = Date.now();
    }

    set_title() {
        window.title = this.title;
    }

    setup_inputs() {
        window.addEventListener("keydown", (event) => {
            if(!(Input.keys_down[event.key] || false)) {
                Input.keys_pressed[event.key] = true;
            }
            Input.keys_down[event.key] = true;
        });
        window.addEventListener("keyup", (event) => {
            Input.keys_pressed[event.key] = false;
            Input.keys_down[event.key] = false;
        });
    }

    play_game() {
        this.set_title();
        this.setup_inputs();
        this.game_loop(this);
    }

    update(delta_time) {
        for(const gameObject of this.gameObjects) {
            gameObject.update(delta_time);
        }
        for (const key of Object.keys(Input.keys_pressed)) {
            Input.keys_pressed[key] = false;
        }
    }

    draw() {
        const current_matrix = Matrix3.Identity();
        for(const gameObject of this.gameObjects) {
            gameObject.draw(this.ctx, current_matrix);
        }
    }

    game_loop(self) {
        const time = Date.now();
        const delta_time = (time - self.last_time) / 1000;
        self.last_time = time;
        self.update(delta_time);
        self.draw();
        requestAnimationFrame(() => {
            self.game_loop(self)
        });
    }
}