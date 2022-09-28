class GameObject {
    constructor(transform, components) {
        this.transform = transform;
        this.components = components;
    }

    update(delta_time) {

    }

    draw(ctx) {

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
        for(const gameObject of this.gameObjects) {
            gameObject.draw(this.ctx);
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