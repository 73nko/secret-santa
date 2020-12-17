const $sky = $(".stars");

const skyHeight = $sky.innerHeight(),
    skyWidth = $sky.innerWidth();
const numberOfStars = (skyWidth * skyHeight) / 10000;
for (let i = 0; i < numberOfStars; i++) {
    const starSize = Math.floor(Math.random() * 8 + 2),
        starTop = Math.floor(Math.random() * skyHeight),
        starLeft = Math.floor(Math.random() * skyWidth);
    $('<div class="star">')
        .css({
            width: starSize,
            height: starSize,
            top: starTop,
            left: starLeft,
        })
        .prependTo($sky);
}
