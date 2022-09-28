class Game {
    constructor(selector, options) {
        this.options = options || {};
        this.selector = selector;
        this.canvas = document.querySelector(selector);
        this.ctx = this.canvas.getContext("2d");
    }

    set_title() {
        document.querySelector("title").innerHTML = this.options.title || "Untitled Game";
    }

    play_game() {
        this.set_title();
    }
}