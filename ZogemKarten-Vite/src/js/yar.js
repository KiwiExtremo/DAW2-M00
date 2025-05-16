import Phaser from 'phaser';

const mainContainer = document.getElementById('render-window');
const width = mainContainer.offsetWidth;
const height = mainContainer.offsetHeight;
const colors = {
    global: {
        background: '0x8B4513',
    },
    score: {
        background: '0x5a3921',
        hover: '0x7a4a2e',
        disabled: '0xaaaaaa',
        text: '#ffffff',
        textHover: '#ffffff',
        textDisabled: '#dddddd',
        scoreBackground: '0xffffff',
        textScore: '#000000'
    },
    redraw: {
        background: '0x47301E',
        hover: '',
        disabled: '',
        text: '#ffffff',
        textHover: '#ffffff',
        textDisabled: '#dddddd',
        textRedraws: '#ffffff'
    },
    scoreBreakpoint: {
        baseline: '0xffffff',
        bad: '0xEB2B25',
        okay: '0xFF8A23',
        great: '0xF8CC1C',
        excellent: '0x94CC1A'
    },
}

const config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    backgroundColor: colors.global.background,
    parent: 'render-window',
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
    render: {
        roundPixels: true
    },
    antialias: true,
    crisp: true
};

// Types of cards
const suits = ['hearts', 'spades', 'diamonds', 'clubs'];
const ranks = ['ace', '2', '3', '4', '5', '6'];

// Global variables
let deck;
let deckCards = [];
let discardPile;
let discardPileCards = [];
let playingCards = [];
let maxRedraws = 4; // The game draws at the start, so gameplay-wise there are only 3 redraws available
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

    // Load bitmap fonts
    this.load.bitmapFont('comic-sans', '/assets/fonts/comic-sans_0.png', '/assets/fonts/comic-sans.fnt');

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

function nextPlayerTurn() {
    redrawsLeft = 3;

    scene.scoreButtons.forEach(button => {
        button.disabled = false;
        button.clear();
        button.fillStyle(0x5a3921, 1);
        button.fillRoundedRect(button.x, button.y, button.width, button.height, 8);
    });
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

    drawButton.fillStyle(colors.redraw.background, 1);
    drawButton.fillRoundedRect(btnX - buttonWidth / 2, btnY - buttonHeight / 2, buttonWidth, buttonHeight, radius);
    drawButton.setInteractive(
        new Phaser.Geom.Rectangle(btnX - buttonWidth / 2, btnY - buttonHeight / 2, buttonWidth, buttonHeight),
        Phaser.Geom.Rectangle.Contains
        );
    drawButton.input.cursor = 'pointer';

    const drawButtonText = scene.add.text(btnX, btnY, 'Robar', {
        fontSize: `${buttonHeight * 0.45}px`,
        color: colors.redraw.text,
        fontFamily: 'Comic Sans MS',
        align: 'center',
        wordWrap: { width: buttonWidth - 10 }
    }).setOrigin(0.5);

    const redrawsLeftText = scene.add.text(btnX, btnY + buttonHeight, '3/3', {
        fontSize: `${buttonHeight * 0.45}px`,
        color: colors.redraw.textRedraws,
        fontFamily: 'Comic Sans MS',
        align: 'center',
        wordWrap: { width: buttonWidth - 10 }
    }).setOrigin(0.5)

    // Save it inside the scene for later processing
    scene.redrawsLeftText = redrawsLeftText;

    // Button click logic
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

    // Score arrays
    scene.pointsTexts = [];
    scene.scoreButtons = [];
    scene.finalScores = [null, null, null, null, null, null];

    for (let i = 0; i < labels.length; i++) {
        const y = startY + i * buttonSpacing;

        // Button parameters
        const button = scene.add.graphics({ x: startX, y: y });
        button.fillStyle(colors.score.background, 1);
        button.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
        button.setInteractive(new Phaser.Geom.Rectangle(0, 0, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);
        button.input.cursor = 'pointer';

        // Button attributes
        button.rankValue = i + 1;
        button.width = buttonWidth;
        button.height = buttonHeight;
        button.disabled = false;
        
        // Button hover styling
        button.on('pointerover', function () {
            if (!button.disabled) {
                button.clear();
                button.fillStyle(colors.score.hover, 1);
                button.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
            }
        });

        // Button unhover styling (back to normal)
        button.on('pointerout', function () {
            if (!button.disabled) {
                button.clear();
                button.fillStyle(colors.score.background, 1);
                button.fillRoundedRect(0, 0, buttonWidth, buttonHeight, 8);
            }
        });

        // Button click logic
        button.on('pointerdown', function() {
            scorePoints(scene, i);
        });

        scene.scoreButtons.push(button);

        // Text of the button
        const btnText = scene.add.text(startX + buttonWidth / 2, y + buttonHeight / 2, labels[i], {
            fontSize: `${buttonHeight * 0.4}px`,
            color: colors.score.text,
            fontFamily: 'Comic Sans MS',
            align: 'center',
            wordWrap: { width: buttonWidth - 10 }
        }).setOrigin(0.5);
        
        // Score display beside the button
        const scoreBg = scene.add.graphics();
        const scoreX = startX + buttonWidth + 10;
        const scoreWidth = cardWidth * 0.7;
        const scoreHeight = buttonHeight;

        scoreBg.fillStyle(colors.score.scoreBackground, 1);
        scoreBg.fillRoundedRect(scoreX, y, scoreWidth, scoreHeight, 8);

        const scoreText = scene.add.text(scoreX + scoreWidth / 2, y + scoreHeight / 2, '0', {
            fontSize: `${scoreHeight * 0.5}px`,
            color: colors.score.textScore,
            fontFamily: 'Comic Sans MS'
        }).setOrigin(0.5);

        scene.pointsTexts.push(scoreText);
    }

    // Total score row
    const totalY = startY + labels.length * buttonSpacing;

    // Total score label
    scene.add.text(startX + buttonWidth / 2, totalY + buttonHeight / 2, "TOTAL", {
        fontSize: `${buttonHeight * 0.45}px`,
        color: colors.score.text,
        fontFamily: 'Comic Sans MS'
    }).setOrigin(0.5);

    // Fondo del total
    const totalBg = scene.add.graphics();
    const scoreX = startX + buttonWidth + 10;
    const scoreWidth = cardWidth * 0.7;
    const scoreHeight = buttonHeight;

    totalBg.fillStyle(colors.score.scoreBackground, 1);
    totalBg.fillRoundedRect(scoreX, totalY, scoreWidth, scoreHeight, 8);
    totalBg.startX = scoreX;
    totalBg.startY = totalY;
    totalBg.width = scoreWidth;
    totalBg.height = scoreHeight;

    console.log('painted total score background, ', totalBg);

    // total score text
    const totalText = scene.add.text(scoreX + scoreWidth / 2, totalY + scoreHeight / 2, '0', {
        fontSize: `${scoreHeight * 0.5}px`,
        color: colors.score.textScore,
        fontFamily: 'Comic Sans MS'
    }).setOrigin(0.5);

    // Save total score attributes to the scene 
    scene.totalScoreBg = totalBg;
    scene.totalScoreText = totalText;
}

function updatePossibleScore(scene) {
    if (!playingCards || !scene.pointsTexts || !scene.finalScores) {
        return;
    }

    const rankCount = [0, 0, 0, 0, 0, 0]; // As a 6

    for (const cardSprite of playingCards) {
        if (!cardSprite) continue;

        const value = cardSprite.cardObj?.value;
        if (value >= 1 && value <= 6) {
            rankCount[value - 1]++;
        }
    }

    for (let i = 0; i < 6; i++) {
        if (scene.finalScores[i] !== null) {
            continue;
        }

        const points = rankCount[i] * (i + 1);
        scene.pointsTexts[i].setText(points.toString());
    }
}

function updateTotalScore(scene) {
    if (!scene.finalScores || !scene.totalScoreText) {
        return;
    }

    const total = scene.finalScores.reduce((sum, val) => sum + (val ?? 0), 0);
    scene.totalScoreText.setText(total.toString());

    updateTotalScoreBackground(scene, total);
    
    scene.tweens.add({
        targets: scene.totalScoreText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 100,
        yoyo: true,
        ease: 'Power1'
    });
}

function updateTotalScoreBackground(scene, total) {
    if (!scene.totalScoreBg || !scene.totalScoreText) {
        return;
    }

    let bgColor = colors.scoreBreakpoint.baseline;

    if (total > 62) {
        bgColor = colors.scoreBreakpoint.excellent;
        
    } else if (total > 35) {
        bgColor = colors.scoreBreakpoint.great;
        
    } else if (total > 17) {
        bgColor = colors.scoreBreakpoint.okay;
        
    } else if (total > 0) {
        bgColor = colors.scoreBreakpoint.bad;
    }

    
    const x = scene.totalScoreBg.startX;
    const y = scene.totalScoreBg.startY;
    const width = scene.totalScoreBg.width;
    const height = scene.totalScoreBg.height;
    
    scene.totalScoreBg.clear();
    scene.totalScoreBg.fillStyle(bgColor, 1);
    scene.totalScoreBg.fillRoundedRect(x, y, width, height, 8);
}

function updateRedrawsLeft(scene) {
    if (redrawsLeft == 0) {
        return false;
    }
    redrawsLeft--;

    scene.redrawsLeftText.setText((redrawsLeft) + '/3');

    return true;
}

function scorePoints(scene, index) {
    const button = scene.scoreButtons[index];
    if (!button || button.disabled) return;

    const rank = button.rankValue;
    const score = fixScore(rank, playingCards);

    scene.pointsTexts[index].setText(score.toString());
    scene.finalScores[index] = score;

    button.disabled = true;
    button.clear();
    button.fillStyle(colors.score.disabled, 1);
    button.fillRoundedRect(0, 0, button.width, button.height, 8);

    updateTotalScore(scene);
    restartDeck(scene);
}

function fixScore(rank, cards) {
    if (!cards || !Array.isArray(cards)) return 0;

    let score = 0;
    for (const card of cards) {
        const value = card?.cardObj?.value;
        if (value === rank) {
            score += rank;
        }
    }
    return score;
}

function shuffleCards() {
    for (let i = deckCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckCards[i], deckCards[j]] = [deckCards[j], deckCards[i]];
    }

    // TODO animate shuffling
}

function restartDeck(scene) {
    // Devolver las cartas de la mesa
    for (let i = 0; i < playingCards.length; i++) {
        const sprite = playingCards[i];
        if (sprite && sprite.cardObj) {
            moveCardBackToDeck(scene, sprite.cardObj, sprite.x, sprite.y);
        }
    }

    playingCards = [];

    // Devolver las cartas de los descartes
    for (let i = 0; i < discardPileCards.length; i++) {
        const cardObj = discardPileCards[i];
        moveCardBackToDeck(scene, cardObj, deck.x, deck.y);
    }

    discardPileCards = [];
    
    shuffleCards();
    restartRedraws();
    redrawCards(scene);

    // Show deck again (just in case it was somehow hidden)
    deck.setAlpha(1);
}

function moveCardBackToDeck(scene, cardObj, startX, startY) {
    const sprite = cardObj.sprite;
    sprite.setDepth(-1);

    // Push card object back to deck
    deckCards.push({
        key: cardObj.key,
        value: cardObj.value,
        suit: cardObj.suit
    });

    // Move card sprite back to deck
    scene.tweens.add({
        targets: sprite,
        x: deck.x,
        y: deck.y,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
            // Destroy card sprite after moving it
            sprite.destroy();
        }
    });
}

function restartRedraws() {
    redrawsLeft = maxRedraws;
}


function redrawCards(scene) {
    //  Skip method if all remaining redraws have been spent
    const hasRedrawsRemaining = updateRedrawsLeft(scene);

    if (!hasRedrawsRemaining) {
        return;
    }

    // card variables
    const cardWidth = scene.sys.game.config.width * 0.08;
    const cardHeight = cardWidth * 1.5;
    const centerY = scene.sys.game.config.height / 2;
    const spacing = cardWidth * 1.1;
    const totalWidth = spacing * 4;
    const startX = (scene.sys.game.config.width / 2) - (totalWidth / 2) + (cardWidth / 2);

    let animationsCompleted = 0;

    // iterate through all 5 current cards
    for (let i = 0; i < 5; i++) {
        const posX = startX + i * spacing;

        const existingCard = playingCards[i];

        // Keep locked card in place
        if (existingCard && existingCard.cardObj.locked) {
            animationsCompleted++;
            continue;
        }

        // Discard non-locked card
        if (existingCard) {
            discardCard(scene, existingCard.cardObj, cardWidth, cardHeight);
        }

        // Draw a new card in place of the discarded one
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
                    addCardInteraction(scene, cardObj, cardWidth, cardHeight, finalY);

                    sprite.cardObj = cardObj;
                    playingCards[i] = sprite;

                    animationsCompleted++;

                    // Update all possible scores based on the new cards drawn
                    if (animationsCompleted === 5) {
                        updatePossibleScore(scene);
                    }
                }
            });
        });
    }

    // Hide drawing deck if no cards remain (shouldn't happen due to redrawing limits)
    if (deckCards.length <= 1) {
        deck.setAlpha(0);
    }
}

function drawCard(scene, cardWidth, cardHeight, drawX, drawY, onCompleteCallback = null) {
    // Pull drawn card out of the deck
    const cardObj = deckCards.pop();
    if (!cardObj) {
        console.warn("No quedan cartas en el mazo.");
        return;
    }

    // Create card sprite
    const sprite = scene.add.image(drawX, drawY, 'card-back');
    const originalWidth = scene.textures.get('card-back').getSourceImage().width;
    const scale = cardWidth / originalWidth;
    sprite.setScale(scale);

    // Animate card flipping halfway
    scene.tweens.add({
        targets: sprite,
        scaleX: 0,
        duration: 150,
        ease: 'Linear',
        onComplete: () => {
            // Swap from card back to card image halfway into animation
            sprite.setTexture(cardObj.key);

            // Recalculate scale of card due to flipping shenaningans
            const newOriginalWidth = scene.textures.get(cardObj.key).getSourceImage().width;
            const newScale = cardWidth / newOriginalWidth;
            sprite.setScale(newScale, scale);

            cardObj.sprite = sprite;

            // Animate rest of flipping
            scene.tweens.add({
                targets: sprite,
                scaleX: newScale,
                duration: 150,
                ease: 'Linear',
                onComplete: () => {
                    if (onCompleteCallback) {
                        onCompleteCallback(sprite, cardObj);
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
