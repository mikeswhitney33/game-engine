class Game {
    constructor(selector, options) {
        this.options = options || {};
        this.selector = selector;
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

    }

    draw() {

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