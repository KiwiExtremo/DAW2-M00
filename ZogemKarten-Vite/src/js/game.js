import Phaser from 'phaser';

const mainContainer = document.getElementById('render-window');
const width = mainContainer.offsetWidth;
const height = mainContainer.offsetHeight;

const config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    backgroundColor: 0x8B4513,
    parent: 'render-window',
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};

let card;
let drawPile;
let discardPile;
let myHand = [];
let maxHand = 7;

function preload() {
    this.load.image('card', '/assets/images/2_of_hearts.png');
    this.load.image('card-back', '/assets/images/card_back.png');
}

function create() {
    // Constants
    const canvasWidth = this.sys.game.config.width;
    const canvasHeight = this.sys.game.config.height;

    const cardWidth = canvasWidth * 0.08;
    const cardHeight = cardWidth * 1.5;

    drawPile = this.add.image(canvasWidth * 0.85, canvasHeight / 2, 'card-back');
    const originalWidth = this.textures.get('card-back').getSourceImage().width;
    const scale = cardWidth / originalWidth;
    drawPile.setScale(scale);

    drawPile.setInteractive();
    drawPile.on('pointerdown', () => {
        drawCard(this, cardWidth, cardHeight, canvasWidth, canvasHeight, drawPile.x, drawPile.y);
    });

    card = this.add.image(drawPileX, drawPileY, 'card-back');
    card.setScale(scale);
}

function update() {
    // Lógica para actualizar el juego
}

function drawCard(scene, cardWidth, cardHeight, canvasWidth, canvasHeight, drawPileX, drawPileY) {
    if (myHand.length >= maxHand) {
        return;
    }

    const card = scene.add.image(drawPileX, drawPileY, 'card-back');
    const originalWidth = scene.textures.get('card-back').getSourceImage().width;
    const scale = cardWidth / originalWidth;
    card.setScale(scale);

    myHand.push(card);

    scene.tweens.add({
        targets: card,
        scaleX: 0,
        duration: 150,
        ease: 'Linear',
        onComplete: () => {
            card.setTexture('card');

            // Cambiar escala de nuevo porque cambia el tamaño original
            const newOriginalWidth = scene.textures.get('card').getSourceImage().width;
            const newScale = cardWidth / newOriginalWidth;
            card.setScale(newScale, scale); // scaleX nuevo, scaleY igual que antes

            scene.tweens.add({
                targets: card,
                scaleX: newScale,
                duration: 150,
                ease: 'Linear',
                onComplete: () => {
                    updateHandLayout(scene, cardWidth, cardHeight);
                }
            });
        }
    });
}

function updateHandLayout(scene, cardWidth, cardHeight) {
    const canvasWidth = scene.sys.game.config.width;
    const canvasHeight = scene.sys.game.config.height;

    const spacing = cardWidth * 0.7;
    const totalWidth = spacing * (myHand.length - 1);
    const startX = (canvasWidth / 2) - (totalWidth / 2);
    const posY = canvasHeight - cardHeight / 2 - 10;

    myHand.forEach((card, index) => {
        const posX = startX + index * spacing;

        scene.tweens.add({
            targets: card,
            x: posX,
            y: posY,
            duration: 300,
            ease: 'Power2'
        });
    });
}

const game = new Phaser.Game(config);
