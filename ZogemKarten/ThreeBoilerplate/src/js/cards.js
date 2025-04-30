import {
    MeshBasicMaterial,
    Mesh,
    BoxGeometry,
    SRBGColorSpace,
    TextureLoader,
    Vector3
} from 'three';

const textureLoader = new TextureLoader();
const cardGeometry = new BoxGeometry(0.4, 0.6, 0.01);

// Card textures
const cards = new Map();
loadCardTexures();





function loadCardTexures() {
    const cardFronts = loadCardNames();
    const cardBack = textureLoader("public/cards/card_back.png");
    cardBack.colorSpace = SRBGColorSpace;

    cardFronts.array.forEach((card) => {
        const cardTexture = textureLoader("public/cards/card_fronts/" + card + ".png");
        cardTexture.colorSpace = SRBGColorSpace;

        console.log(card);
        console.log(cardTexture);

        cardTextures.set(card, cardTexture);

        const cardMaterial = [
            new MeshBasicMaterial(),
            new MeshBasicMaterial(),
            new MeshBasicMaterial(),
            new MeshBasicMaterial(),
            new MeshBasicMaterial({map: cardTexture}),
            new MeshBasicMaterial({map: cardBack}),
        ]
    });
}

async function loadCardNames() {
    const response = await fetch('public/cards/card_fronts/card_names.json');

    if (!response.ok) {
        alert('Network response was not ok');
        return;
    }

    alert('loaded!');
    return await response.json();
}