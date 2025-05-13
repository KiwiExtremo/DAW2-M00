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
const ranks = ['ace', '2', '3', '4', '5', '6'];

let deck;
let deckCards = [];
let discardPile;
let discardPileCards = [];
let playingCards = [];
let maxRedraws = 3;
let redrawsLeft = maxRedraws;

function preload() {
    // Load all card textures
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
            deckCards.push({
                key: `${rank}_of_${suit}`,
                value: rank === 'ace' ? 1 : parseInt(rank),
                suit: suit
            });
        }
    }

    shuffleCards();

    addRedrawButton(this);
    addScoreButtons(this);

    redrawCards(this);
}

function update() {
    // Lógica para actualizar el juego
}

function startNewTurn() {
    redrawsLeft = 3;
}

function addRedrawButton(scene) {
    const canvasWidth = scene.sys.game.config.width;
    const cardWidth = canvasWidth * 0.08;
    const cardHeight = cardWidth * 1.5;

    const buttonWidth = cardWidth * 1.2;
    const buttonHeight = cardHeight * 0.3;

    const drawButton = scene.add.graphics();
    const radius = buttonHeight / 4;
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
        fontSize: `${buttonHeight * 0.45}px`,
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Interacción al hacer clic
    drawButton.on('pointerdown', () => {
        redrawCards(scene);
    });
}

function addScoreButtons(scene) {
    const canvasWidth = scene.sys.game.config.width;
    const canvasHeight = scene.sys.game.config.height;

    const cardWidth = canvasWidth * 0.08;
    const cardHeight = cardWidth * 1.5;

    const buttonWidth = cardWidth * 2;
    const buttonHeight = cardHeight * 0.4;
    const buttonSpacing = buttonHeight * 1.2;

    const startX = canvasWidth * 0.05;
    const startY = canvasHeight * 0.2;

    const labels = [
        "UNO es soledad",
        "DOS son compañía",
        "TRES son multitud",
        "CUATROS, buenos ratos",
        "CINCOS, grandes amigos",
        "Del SEIS, no os olvidéis"
    ];

    scene.scoreTexts = []; // Array para guardar textos de puntuación

    for (let i = 0; i < labels.length; i++) {
        const y = startY + i * buttonSpacing;

        // Button parameters
        const button = scene.add.graphics();
        button.fillStyle(0x5a3921, 1);
        button.fillRoundedRect(startX, y, buttonWidth, buttonHeight, 8);
        button.setInteractive(new Phaser.Geom.Rectangle(startX, y, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        button.input.cursor = 'pointer';

        // Button score
        button.rankValue = i + 1;
        
        // Text of the button
        const label = scene.add.text(startX + buttonWidth / 2, y + buttonHeight / 2, labels[i], {
            fontSize: `${buttonHeight * 0.4}px`,
            color: '#ffffff',
            fontFamily: 'Arial',
            align: 'center',
            wordWrap: { width: buttonWidth - 10 }
        }).setOrigin(0.5);
        
        // Score rectangle beside the button
        const scoreBg = scene.add.graphics();
        const scoreX = startX + buttonWidth + 10;
        const scoreWidth = cardWidth * 0.7;
        const scoreHeight = buttonHeight;

        scoreBg.fillStyle(0xffffff, 1);
        scoreBg.fillRoundedRect(scoreX, y, scoreWidth, scoreHeight, 8);

        const scoreText = scene.add.text(scoreX + scoreWidth / 2, y + scoreHeight / 2, '0', {
            fontSize: `${scoreHeight * 0.5}px`,
            color: '#000000',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        scene.scoreTexts.push(scoreText);
    }
}

function updateScore(scene) {
    if (!playingCards || !scene.scoreTexts) return;

    const rankCount = [0, 0, 0, 0, 0, 0]; // As a 6

    for (const cardSprite of playingCards) {
        if (!cardSprite) continue;

        const value = cardSprite.cardObj?.value;
        if (value >= 1 && value <= 6) {
            rankCount[value - 1]++;
        }
    }

    for (let i = 0; i < 6; i++) {
        const points = rankCount[i] * (i + 1);
        scene.scoreTexts[i].setText(points.toString());
    }
}

function shuffleCards() {
    for (let i = deckCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckCards[i], deckCards[j]] = [deckCards[j], deckCards[i]];
    }
}

function redrawCards(scene) {
    // if (redrawsLeft <= 0) {
    //     return;
    // }
    // redrawsLeft--;

    const cardWidth = scene.sys.game.config.width * 0.08;
    const cardHeight = cardWidth * 1.5;
    const centerY = scene.sys.game.config.height / 2;
    const spacing = cardWidth * 1.1;
    const totalWidth = spacing * 4;
    const startX = (scene.sys.game.config.width / 2) - (totalWidth / 2) + (cardWidth / 2);

    let animationsCompleted = 0;

    for (let i = 0; i < 5; i++) {
        const posX = startX + i * spacing;

        const existingCard = playingCards[i];

        if (existingCard && existingCard.cardObj.locked) {
            // Mantener carta fijada en su sitio
            animationsCompleted++;
            continue;
        }

        // Si hay una carta no fijada, se descarta
        if (existingCard) {
            discardCard(scene, existingCard.cardObj, cardWidth, cardHeight);
        }

        drawCard(scene, cardWidth, cardHeight, deck.x, deck.y, (sprite, cardObj) => {
            const finalY = centerY;
            const finalX = posX;

            scene.tweens.add({
                targets: sprite,
                x: finalX,
                y: finalY,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    // Solo después de estar en posición se agrega la interacción
                    addCardInteraction(scene, cardObj, cardWidth, cardHeight, finalY);

                    sprite.cardObj = cardObj;
                    playingCards[i] = sprite;

                    animationsCompleted++;
                    if (animationsCompleted === 5) {
                        // Update all possible scores based on the new cards drawn
                        updateScore(scene);
                    }
                }
            });
        });
    }

    // Oculta mazo si queda 1 carta
    if (deckCards.length <= 1) deck.setAlpha(0);
}

function drawCard(scene, cardWidth, cardHeight, drawX, drawY, onCompleteCallback = null) {
    // Get drawn card out of the deck
    const cardObj = deckCards.pop();
    if (!cardObj) {
        console.warn("No quedan cartas en el mazo.");
        return;
    }

    // Create visual card
    const tempCard = scene.add.image(drawX, drawY, 'card-back');
    const originalWidth = scene.textures.get('card-back').getSourceImage().width;
    const scale = cardWidth / originalWidth;
    tempCard.setScale(scale);

    // Animate card flipping halfway
    scene.tweens.add({
        targets: tempCard,
        scaleX: 0,
        duration: 150,
        ease: 'Linear',
        onComplete: () => {
            tempCard.setTexture(cardObj.key);

            // Recalculate scale of card due to flipping shenaningans
            const newOriginalWidth = scene.textures.get(cardObj.key).getSourceImage().width;
            const newScale = cardWidth / newOriginalWidth;
            tempCard.setScale(newScale, scale);

            cardObj.sprite = tempCard;

            // Animate rest of flipping
            scene.tweens.add({
                targets: tempCard,
                scaleX: newScale,
                duration: 150,
                ease: 'Linear',
                onComplete: () => {
                    if (onCompleteCallback) {
                        onCompleteCallback(tempCard, cardObj);
                    }
                }
            });
        }
    });
}

function addCardInteraction(scene, cardObj, cardWidth, cardHeight, initialY) {
    const card = cardObj.sprite;

    const lockedCards = scene.lockedCards || new Set();
    scene.lockedCards = lockedCards;

    const elevateOffset = 50;
    card.setInteractive();

    cardObj.locked = false;

    card.on('pointerover', () => {
        if (!cardObj.locked) {
            scene.tweens.add({
                targets: card,
                y: initialY - elevateOffset,
                duration: 200,
                ease: 'Power2'
            });
        }
    });

    card.on('pointerout', () => {
        if (!cardObj.locked) {
            scene.tweens.add({
                targets: card,
                y: initialY,
                duration: 200,
                ease: 'Power2'
            });
        }
    });

    card.on('pointerdown', () => {
        if (!cardObj.locked) {
            // Lock the card
            cardObj.locked = true;
            lockedCards.add(card);

            // Keep card elevated
            card.y = initialY - elevateOffset;

            // Add visual lock under the card
            const lockIcon = scene.add.text(card.x, card.y + card.displayHeight / 2 + 30, '🔒', {
                fontSize: '20px',
                color: '#000'
            }).setOrigin(0.5);
            
            cardObj.lockIcon = lockIcon;
        } else {
        // Unlock the card
        cardObj.locked = false;
        lockedCards.delete(card);

        // Return card to original position
        scene.tweens.add({
            targets: card,
            y: initialY,
            duration: 200,
            ease: 'Power2'
        });

        // Remove lock icon
        if (cardObj.lockIcon) {
            cardObj.lockIcon.destroy();
            delete cardObj.lockIcon;
        }
    }
    });
}

function discardCard(scene, cardObj, cardWidth, cardHeight) {
    const card = cardObj.sprite;
    card.setDepth(discardPileCards.length);

    // Añadir la carta al montón de descartes
    discardPileCards.push(cardObj);

    // Eliminar la carta de playingCards
    const index = playingCards.findIndex(c => c && c.cardObj === cardObj);
    
    if (index !== -1) {
        playingCards[index] = null;
    }

    scene.tweens.add({
        targets: card,
        x: discardPile.x,
        y: discardPile.y,
        duration: 400,
        ease: 'Power2',
        onComplete: () => {
            card.removeAllListeners();
        }
    });
}

const game = new Phaser.Game(config);
