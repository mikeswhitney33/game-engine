


class Game {
    constructor(selector, title="Untitled Game") {
        this.title = title;
        this.selector = selector;
        this.canvas = document.querySelector(selector);
        this.ctx = this.canvas.getContext("2d");
    }
}