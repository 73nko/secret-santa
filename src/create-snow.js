const $sky = $(".stars");

const skyHeight = $sky.innerHeight(),
    skyWidth = $sky.innerWidth();
const numberOfSnow = (skyWidth * skyHeight) / 1000;
for (let i = 0; i < numberOfSnow; i++) {
    $('<div class="snow">').prependTo($sky);
}
