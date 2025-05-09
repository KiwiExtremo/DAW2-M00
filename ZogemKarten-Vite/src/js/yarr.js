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

const suits = ['hearts', 'spades', 'diamonds', 'clubs'];
const ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

let deck;
let deckCards = [];
let discardPile;
let discardPileCards = [];
let myHand = [];
let maxHand = 7;

function preload() {
    for (const suit of suits) {
        for (const rank of ranks) {
            const key = `${rank}_of_${suit}`;
            this.load.image(key, `/assets/images/${key}.png`);
        }
    }
    
    this.load.image('card-back', '/assets/images/card_back.png');
}

function create() {
    // Constants
    const canvasWidth = this.sys.game.config.width;
    const canvasHeight = this.sys.game.config.height;

    const cardWidth = canvasWidth * 0.08;
    const cardHeight = cardWidth * 1.5;

    // Create visual deck
    deck = this.add.image(canvasWidth * 0.85, canvasHeight * 0.63, 'card-back');
    const originalWidth = this.textures.get('card-back').getSourceImage().width;
    const scale = cardWidth / originalWidth;
    deck.setScale(scale);

    // Make deck clickable to draw a card
    deck.setInteractive();
    deck.on('pointerdown', () => {
        drawCard(this, cardWidth, cardHeight, canvasWidth, canvasHeight, deck.x, deck.y);
    });

    // Create visual discard pile
    discardPile = this.add.image(canvasWidth * 0.85, canvasHeight * 0.37, 'card-back');
    discardPile.setAlpha(0); // Invisible al inicio
    discardPile.setScale(scale);

    // Add all card objects to the deck
    for (const suit of suits) {
        for (const rank of ranks) {
            deckCards.push(`${rank}_of_${suit}`);
        }
    }

    shuffleCards();

    addDrawButton(this);
}

function update() {
    // Lógica para actualizar el juego
}

function addDrawButton(scene) {
    // Crear botón "Robar"
    const buttonWidth = 100;
    const buttonHeight = 40;

    const drawButton = scene.add.graphics();
    const radius = 10;
    const btnX = deck.x;
    const btnY = deck.y + deck.displayHeight / 2 + 30;

    drawButton.fillStyle(0x47301E, 1);
    drawButton.fillRoundedRect(btnX - buttonWidth / 2, btnY - buttonHeight / 2, buttonWidth, buttonHeight, radius);
    drawButton.setInteractive(
        new Phaser.Geom.Rectangle(btnX - buttonWidth / 2, btnY - buttonHeight / 2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
        );
    drawButton.input.cursor = 'pointer';

    const drawButtonText = scene.add.text(btnX, btnY, 'Robar', {
        fontSize: '16px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Interacción al hacer clic
    drawButton.on('pointerdown', () => {
        redrawCards(scene,
            scene.sys.game.config.width * 0.08,
            scene.sys.game.config.width * 0.08 * 1.5,
            scene.sys.game.config.width,
            scene.sys.game.config.height,
                deck.x,
                deck.y);
    });
}

function shuffleCards() {
    for (let i = deckCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckCards[i], deckCards[j]] = [deckCards[j], deckCards[i]];
    }
}

function drawCard(scene, cardWidth, cardHeight, canvasWidth, canvasHeight, drawPileX, drawPileY) {
    // Hide visual deck when the last card is drawn
    if (deckCards.length === 1) {
        deck.setAlpha(0);    
    }

    // Do not let user draw a new card if there are no cards left, or if hand is full
    if (myHand.length >= maxHand || deckCards.length === 0) {
        return;
    }

    // Get drawn card out of the deck
    const cardKey = deckCards.pop();

    // Create visual card
    const card = scene.add.image(drawPileX, drawPileY, 'card-back');
    const originalWidth = scene.textures.get('card-back').getSourceImage().width;
    const scale = cardWidth / originalWidth;
    card.setScale(scale);

    // Add card to player hand
    myHand.push(card);

    // Animate card flipping halfway
    scene.tweens.add({
        targets: card,
        scaleX: 0,
        duration: 150,
        ease: 'Linear',
        onComplete: () => {
            card.setTexture(cardKey);

            // Recalculate scale of card due to flipping shenaningans
            const newOriginalWidth = scene.textures.get(cardKey).getSourceImage().width;
            const newScale = cardWidth / newOriginalWidth;
            card.setScale(newScale, scale);

            // Animate rest of flipping
            scene.tweens.add({
                targets: card,
                scaleX: newScale,
                duration: 150,
                ease: 'Linear',
                onComplete: () => {
                    updateHandLayout(scene, cardWidth, cardHeight);
                    addCardInteraction(scene, card, cardWidth, cardHeight);
                }
            });
        }
    });
}

function redrawCards(scene, cardWidth, cardHeight, canvasWidth, canvasHeight, drawPileX, drawPileY) {
    for (card in cards) {
        
    }
}

function updateHandLayout(scene, cardWidth, cardHeight) {
    const canvasWidth = scene.sys.game.config.width;
    const canvasHeight = scene.sys.game.config.height;

    const spacing = cardWidth * 0.5;
    const totalWidth = spacing * (myHand.length - 1);
    const startX = (canvasWidth / 2) - (totalWidth / 2);
    const posY = canvasHeight - cardHeight / 2 - 10;

    myHand.forEach((card, index) => {
        const posX = startX + index * spacing;
        card.setDepth(0);

        scene.tweens.add({
            targets: card,
            x: posX,
            y: posY,
            duration: 300,
            ease: 'Power2'
        });
    });
}

function addCardInteraction(scene, card, cardWidth, cardHeight) {
    const canvasHeight = scene.sys.game.config.height;
    const posY = canvasHeight - cardHeight / 2 - 10;

    card.setInteractive();

    card.on('pointerdown', () => {
        card.removeAllListeners();
        discardCard(scene, card, cardWidth, cardHeight);
    });

    card.on('pointerover', () => {
        scene.tweens.add({
            targets: card,
            y: posY - 50,
            duration: 200,
            ease: 'Power2'
        });
    });

    card.on('pointerout', () => {
        scene.tweens.add({
            targets: card,
            y: posY,
            duration: 200,
            ease: 'Power2'
        });
    });
}

function discardCard(scene, card, cardWidth, cardHeight) {
    card.setDepth(discardPileCards.length);

    // Eliminarla del array de mano
    const index = myHand.indexOf(card);

    if (index === -1) {
        return;
    }

    myHand.splice(index, 1);

    // Añadir al array de descartes
    discardPileCards.push(card);

    // Visual: animación a pila de descartes
    const targetX = discardPile.x;
    const targetY = discardPile.y;

    scene.tweens.add({
        targets: card,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
            card.removeAllListeners();
        }
    });

    // Reorganizar mano
    updateHandLayout(scene, cardWidth, cardHeight);
}

const game = new Phaser.Game(config);
