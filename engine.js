class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
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
        return new Matrix3.Transform(matrix, point, 1);
    }

    static TransformVector(matrix, vector) {
        return new Matrix3.Transform(matrix, vector, 0);
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

class GameObject {
    constructor(name, transform, components, children) {
        this.name = name || "Untitled";
        this.transform = transform || Transform.Identity2();
        this.components = components || [];
        this.children = children || [];
    }

    update(delta_time) {
        for(const component of components) {
            component.update(this, delta_time);
        }
        for(const child of this.children) {
            child.update(delta_time);
        }
    }

    draw(ctx, current_matrix) {
        current_matrix = Matrix3.Matmul(current_matrix, this.transform.get_matrix());
        for(const component of components) {
            component.draw(ctx, current_matrix);
        }
        for(const child of this.children) {
            child.draw(ctx, current_matrix);
        }
    }
}

class Game {
    constructor(selector, options, gameObjects) {
        this.selector = selector;
        this.options = options || {};
        this.gameObjects = gameObjects || [];

        this.canvas = document.querySelector(selector);
        this.ctx = this.canvas.getContext(this.options.context || "2d");
        this.last_time = Date.now();
    }

    set_title() {
        document.querySelector("title").innerHTML = this.options.title || "Untitled Game";
    }

    play_game() {
        this.set_title();
    }

    update(delta_time) {
        for(const gameObject of this.gameObjects) {
            gameObject.update(delta_time);
        }
    }

    draw() {
        const current_matrix = Matrix3.Identity();
        for(const gameObject of this.gameObjects) {
            gameObject.draw(this.ctx, current_matrix);
        }
    }

    game_loop() {
        const time = Data.now();
        const delta_time = time - this.last_time;
        this.last_time = time;
        this.update(delta_time);
        this.draw();
        requestAnimationFrame(game_loop);
    }
}