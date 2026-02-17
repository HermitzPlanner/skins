function getCharObject(char, charData) {

    for (const key in charData) {
        if (charData[key].appellation === char) {
            charData[key].rarityNumber = charData[key].rarity.match(/\d+/)[0]
            //char.code = char.potentialItemId.split("_").slice(1).join("_")
            //char.shortName = char.appellation.replace(" The ", " ").replace(" the ", " ").split(" ")[0]
            //char.iconSrc = "https://raw.githubusercontent.com/fexli/ArknightsResource/main/avatar/ASSISTANT/" + char.potentialItemId.split("_").slice(1).join("_") + ".png"

            return charData[key]; // Return the matching object
        }
    }
    console.error(char)
    return null; // Return null if no match is found
}

let lastSection = 'main'

function viewer(plannerId, skinName, skinsData, charData) {
    resetDiv('viewer');
    clearCanvas()
    const container = getDiv('viewer');

    //if (!plannerId.includes('0')) {
    artRender(container, plannerId)
    if (!plannerId.includes('0')) infoRender(container, plannerId, skinName, skinsData, charData)
    if (plannerId.includes('0')) operatorInfoRender(container, plannerId, skinsData)
    //}

    create(container, 'div', 'drag the image with click <br> scroll to zoom', 'viewer-tips')
}

function animate(element, animation) {
    element.classList.add('hide');
    element.onload = () => {
        element.classList.remove('hide');
        element.classList.add(animation)
    };
}

function artRender(container, plannerId) {
    const img = document.createElement('img');
    const bg = document.createElement('img')
    img.id = 'viewer-image';
    bg.id = 'viewer-image-background';
    img.src = imgrepo('art', plannerId);
    bg.src = imgrepo('art', plannerId);

    animate(img, 'viewer-show-image')
    animate(bg, 'viewer-show-image-background')

    container.append(img)
    container.append(bg)

    addImageInteraction(img)
}

let dynamicColor = false
function infoRender(container, plannerId, skinName, skinsData, charData) {
    const skinObject = findSkinByName(skinsData.cnData, skinName)
    const modelName = skinObject.displaySkin.modelName
    const charObject = getCharObject(modelName, charData)
    console.log("skinObject from viewer", skinObject)
    console.log("charObject from viewer", charObject)

    const avatarId = skinObject.avatarId
    const skinObjectGlobal = findSkinByAvatar(skinsData.enData, avatarId)
    const skinNameGlobal = skinObjectGlobal?.displaySkin?.skinName || skinName
    const artist = skinObject.displaySkin.drawerList
    const obtainApproach = obtainApproachesMap[skinObject.displaySkin.obtainApproach]
    const skinGroupId = skinObject.displaySkin.skinGroupId
    const brand = skinsData.cnData.brandList[skinGroupId?.split('#')[1]]?.brandCapitalName || 'CROSSOVER'
    const upcomingEvents = getEventListByName(skinName)
    const cnRelease = getReleaseTime(skinObject.displaySkin.getTime)
    const enRelease = getReleaseTime(skinObjectGlobal?.displaySkin?.getTime || null)

    const colorList = Array.from(new Set(skinObject.displaySkin.colorList));

    let price = skinsData.costMap[skinName] > 0 ? skinsData.costMap[skinName] : 'Free'
    if (plannerId == "thorns1") price = 18
    if (NoEffectSkins.includes(plannerId)) price = '15'

    // ====================================================
    // Information column. Everything will be appended here
    // ====================================================

    const infoDiv = document.createElement('div')
    infoDiv.style.backgroundColor = hexToHsl("#111014")
    infoDiv.id = 'viewer-info'

    // ====================================================
    // Top Buttons
    // ====================================================

    const quitViewerButton = document.createElement('button')
    quitViewerButton.textContent = 'Quit'
    quitViewerButton.classList.add('quit-viewer-button')
    quitViewerButton.onclick = () => { showSection(lastSection)}

    const collapseOrExpandButton = document.createElement('button')
    collapseOrExpandButton.textContent = 'Collapse'
    collapseOrExpandButton.classList.add('quit-viewer-button')
    collapseOrExpandButton.classList.add('collapse-viewer-button')
    collapseOrExpandButton.onclick = () => { collapseOrExpand(collapseOrExpandButton) }

    infoDiv.append(quitViewerButton)
    infoDiv.append(collapseOrExpandButton)

    rarityImg = document.createElement("img")
    rarityImg.src = `static/gacha_detail_hub/star_${charObject.rarityNumber}.png`
    rarityImg.className = "viewer-rarity"
    //rarityImg.style.filter = getTextColor(primaryColor) !== "#ffffff" ? "grayscale(1) brightness(2) drop-shadow(2px 2px 1px #ffffff33) invert()" : "grayscale(1) brightness(2) drop-shadow(2px 2px 1px #ffffff33)"

    infoDiv.append(rarityImg)

    // ====================================================
    // Color List Div
    // ====================================================

    const colorListDiv = document.createElement('div');
    colorListDiv.className = 'color-list-div';

    const defaultColorButton = document.createElement("button")
    defaultColorButton.style.backgroundColor = "var(--body-bg)";
    defaultColorButton.classList.add("color-button")
    defaultColorButton.onclick = () => { updateColors("#111014", "#1f1e25") }
    //colorListDiv.append(defaultColorButton)

    let colorStyles = [];

    colorList.forEach((color, index) => {
        if (color.trim() !== '') { // Skip empty strings
            const colorDiv = document.createElement('button');
            colorDiv.style.backgroundColor = color;
            colorDiv.classList.add("color-button")
            colorDiv.onclick = () => { updateColors(color, colorList[index + 1]) }

            colorListDiv.appendChild(colorDiv);

            colorStyles.push(hexToRgba(color, 0.1));
        }
    });

    infoDiv.append(colorListDiv);

    // ====================================================
    // Viewer Header (Icon + Name + Skin Name)
    // ====================================================

    //document.documentElement.style.setProperty('--scrollbar-track', `${primaryColor}`)
    //document.documentElement.style.setProperty('--scrollbar-thumb', `${secondaryColor}`)

    const header = document.createElement('div')
    header.className = 'viewer-header'

    const iconBrandDiv = document.createElement("img")
    iconBrandDiv.src = `static/img/brands/${brand}.png`
    iconBrandDiv.className = "viewer-icon-image dynamic-img-color"

    const modelNameDiv = document.createElement("div")
    modelNameDiv.classList.add('viewer-model-name')
    modelNameDiv.classList.add('primary-color')
    modelNameDiv.textContent = skinObject.displaySkin.modelName

    const professionImg = document.createElement("img")
    professionImg.src = "static/friend_assist_profession_hub/icon_profession_" + charObject.profession + ".png"
    professionImg.className = "viewer-profession-icon dynamic-img-color"
    modelNameDiv.append(professionImg)

    const skinNameDiv = document.createElement("div")
    skinNameDiv.classList.add('viewer-skin-name')
    skinNameDiv.classList.add('primary-color')
    skinNameDiv.textContent = `《 ${skinNameGlobal} 》`

    header.append(iconBrandDiv)
    header.append(modelNameDiv)
    header.append(skinNameDiv)

    animate(iconBrandDiv, 'viewer-show-image')
    animateText(modelNameDiv)
    animateText(skinNameDiv, 0.15)

    infoDiv.append(header)

    // ====================================================
    // Canvas for the chibi
    // ====================================================

    createCanvasDiv(infoDiv, plannerId, skinName, skinsData, colorList[0], colorList[1], colorList[1], charData)

    // ====================================================
    // Information Rows
    // ====================================================

    const infoRows = document.createElement('div')
    infoRows.className = 'info-rows'

    const priceText = price == 'Free' ? 'Free Skin' : 'Price: ' + price

    const skinPriceDiv = create(infoRows, 'div', priceText, 'viewer-row')

    if (price > 0) {

        const originiteImage = document.createElement('img')
        originiteImage.src = originiteLink
        skinPriceDiv.append(originiteImage)
        animate(originiteImage, 'viewer-show-image')

    }


    const artistDiv = create(infoRows, 'div', 'Artist: ' + artist, 'viewer-row')
    const obtainDiv = create(infoRows, 'div', obtainApproach, 'viewer-row')
    const brandDiv = create(infoRows, 'div', brand, 'viewer-row')
    const cnReleaseDiv = create(infoRows, 'div', 'CN Release: ' + cnRelease, 'viewer-row')
    const enReleaseDiv = create(infoRows, 'div', enRelease == 'Not released' ? enRelease + ' in Global' : 'EN Release: ' + enRelease, 'viewer-row')

    skinPriceDiv.classList.add("primary-color")
    artistDiv.classList.add("primary-color")
    obtainDiv.classList.add("primary-color")
    brandDiv.classList.add("primary-color")
    cnReleaseDiv.classList.add("primary-color")
    enReleaseDiv.classList.add("primary-color")

    animateText(skinPriceDiv, 0.05)
    animateText(artistDiv)
    animateText(obtainDiv)
    animateText(brandDiv)
    animateText(cnReleaseDiv)
    animateText(enReleaseDiv)

    // ====================================================
    // Upcoming Events Div
    // ====================================================

    upcomingEvents.forEach(upcomingEvent => {
        const div = create(infoRows, 'div', '', 'viewer-row-double secondary-color')
        const cartImage = document.createElement('img')
        cartImage.className = "dynamic-img-color-secondary"
        cartImage.style.filter = 'invert()'
        cartImage.style.marginLeft = '0'
        cartImage.style.marginRight = '5px'
        cartImage.src = cartLink
        div.append(cartImage)
        animate(cartImage, 'viewer-show-image')
        console.log("upcomingEvent", upcomingEvent)
        div.append(upcomingEvent)

    });

    // const hideInfoDiv = document.createElement("button");
    // hideInfoDiv.textContent = "Amogsdjlkdsf";
    // hideInfoDiv.onclick = function () {
    //     infoDiv.style.width = "0px"
    // };
    // infoRows.append(hideInfoDiv)

    infoDiv.append(infoRows)

    if (videos[plannerId] && videos[plannerId] > 0) {
        for (let index = 1; index <= videos[plannerId]; index++) {
            const video = document.createElement("video");
            video.src = `https://github.com/HermitzPlanner/chibi-effects/raw/refs/heads/main/${plannerId}/${index}.mp4`;
            video.autoplay = true
            video.controls = true
            video.muted = true
            video.autoplay = true
            video.loop = true
            video.preload = "metadata"
            video.style.borderRadius = "15px";
            video.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)"; // para que queden zarpados

            infoDiv.appendChild(video);
        }
    }

    container.append(infoDiv)

    let angle = 45
    const linearGradient = true
    let gradient = linearGradient ? `linear-gradient(${angle}deg, ${colorStyles.join(', ')})` : `radial-gradient(circle, ${colorStyles.join(', ')})`;
    getDiv('viewer').style.background = gradient;

    // const hsl = hexToHSL(colorList[0])
    // let match = hsl.match(/^hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)$/i);
    // let [, hue, ,] = match; // We only need the hue, we'll adjust saturation and lightness
    // let newHsl = `hsl(${hue}, 25%, 7%)`; // Set saturation to 11% and lightness to 7%


    // const viewerElements = '.viewer-row, .viewer-model-name, .viewer-skin-name, .viewer-row-double, .chibi-row';
    // document.querySelectorAll(viewerElements).forEach(element => {

    //     element.style.backgroundColor = newHsl;
    // });

    function extraColors() {
        const viewerElements = '.viewer-row, .viewer-model-name, .viewer-skin-name, .viewer-row-double, .chibi-row';


        const usedColor = colorList[0]; // First color for viewer elements

        document.getElementById('viewer-info').style.background = usedColor

        // Apply background color to viewer elements
        document.querySelectorAll(viewerElements).forEach(element => {
            // element.style.backgroundColor = usedColor;
        });

        // Find a different color for chibi-row
        let chibiColorIndex = 1; // Start from the next color
        while (chibiColorIndex < colorList.length && (colorList[chibiColorIndex] === usedColor || !colorList[chibiColorIndex])) {
            chibiColorIndex++; // Skip if same or empty
        }

        // Use the found color (or fallback to the last valid color)
        const chibiColor = colorList[chibiColorIndex] || usedColor;

        // Apply background color to chibi-row elements
        document.querySelectorAll(viewerElements).forEach(element => {
            element.style.backgroundColor = chibiColor;
        });

        //app.renderer.backgroundColor = `0x${colorList[0].replace('#', '')}`; // Changes to red
    }
}

function operatorInfoRender(container, plannerId, skinsData) {
    const infoDiv = document.createElement('div')
    infoDiv.id = 'viewer-info'
    //const skinName = '暗月的影子'
    createCanvasDiv(infoDiv, plannerId, skinName, skinsData)
    container.append(infoDiv)
}

function createCanvasDiv(infoDiv, plannerId, skinName, skinsData, primaryColor, secondaryColor, tertiaryColor, charData) {
    const transparentBg = false
    const canvas = document.createElement('div')
    canvas.id = "chibi-canvas"
    canvas.className = 'viewer-canvas'
    canvas.style.background = "none" // : getTextColor(primaryColor) == "#ffffff" ? "hsl(0deg 0% 0% / 50%)" : "hsl(0deg 0% 100% / 50%)"

    const chibiButtons = document.createElement('div')

    chibiButtons.className = 'chibi-buttons primary-color hide'

    const changeSkinButton = create(chibiButtons, 'button', "Change Skin", 'chibi-row secondary-color')


    const animationListButton = create(chibiButtons, 'button', "Animation List", 'chibi-row secondary-color')


    const perspectiveButton = create(chibiButtons, 'button', "Perspective", 'chibi-row secondary-color')


    const saveSvg = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/save.svg"
    const downloadChibiButton = create(chibiButtons, 'button', "", 'chibi-row secondary-color')


    const saveDiv = document.createElement("img") //create(downloadChibiButton, 'img', saveSvg)
    saveDiv.src = saveSvg
    saveDiv.className = 'svg chibi-save-img'
    saveDiv.style.width = '15px'
    saveDiv.style.filter = 'invert()'

    downloadChibiButton.append(saveDiv)

    renderCanvas(plannerId, skinName, skinsData)
    infoDiv.append(canvas)
    canvas.append(app.view)
    canvas.append(chibiButtons)

    const animationListDiv = create(infoDiv, 'div')
    animationListDiv.className = 'animation-list-div hide'

    changeSkinButton.onclick = () => {
        const skinSelector = document.createElement('div')
        skinSelector.className = 'skin-selector'


        const matches = getMatchingPlannerIds(plannerId, skinsData)

        matches.forEach((match, index) => {
            if (match.includes('0')) return
            const matchSkinName = getKeyByValue(skinsData.plannerIdMap, match)
            const matchDiv = document.createElement('button');
            matchDiv.className = 'change-skin';
            matchDiv.textContent = match;

            // Set animation delay based on index
            matchDiv.style.animationDelay = `${index * 100}ms`; // Adjust timing as needed

            const img = document.createElement('img');
            //img.src = match.includes('0') ? defaultimgrepo('icon', operatorMap[match]) : imgrepo('icon', match);
            img.src = imgrepo('icon', match);

            matchDiv.append(img);

            skinSelector.append(matchDiv);

            matchDiv.onclick = () => {
                viewer(match, matchSkinName, skinsData, charData)
                skinSelector.remove()
            }
        });
        document.body.append(skinSelector)
    }

    animationListButton.onclick = () => {
        animationListDiv.innerHTML = ''
        animationListDiv.classList.remove('hide')
        animationListDiv.classList.add('show')

        createQuitButton(animationListDiv)

        animationList.forEach(animation => {
            const animationButton = document.createElement('button')
            animationButton.value = animation.name
            animationButton.textContent = animation.name.replaceAll('_', ' ')
            animationListDiv.append(animationButton)

            animationButton.onclick = () => {
                // Check if the animation contains 'Begin' or 'End'
                const loop = !animation.name.includes('Begin') && !animation.name.includes('End');
                console.log(skinSpine)
                // Set the animation with the appropriate loop value
                skinSpine.state.setAnimation(0, animation.name, loop);

                // If the animation contains 'Begin' or 'End', listen for completion
                if (animation.name.includes('Begin') || animation.name.includes('End')) {
                    skinSpine.state.addListener({
                        complete: (event) => {
                            if (event.animation.name === animation.name) {
                                let newAnimationName;

                                if (event.animation.name.includes('Begin')) {
                                    // Replace 'Begin' with 'Loop' for the transition animation
                                    newAnimationName = event.animation.name.replace('Begin', 'Loop');
                                    if (!skinSpine.spineData.findAnimation(newAnimationName)) {
                                        // If Loop doesn't exist, try Chant animation
                                        newAnimationName = event.animation.name.replace('Begin', 'Chant');
                                        if (!skinSpine.spineData.findAnimation(newAnimationName)) {
                                            return; // No valid animation found
                                        }
                                    }
                                } else if (event.animation.name.includes('End')) {
                                    // Replace 'End' with 'Begin' for the next transition
                                    newAnimationName = event.animation.name.replace('End', 'Begin');
                                    if (!skinSpine.spineData.findAnimation(newAnimationName)) {
                                        return; // No 'Begin' animation found
                                    }

                                    // Set 'Begin' first, then after it completes, set 'Loop' or 'Chant'
                                    skinSpine.state.setAnimation(0, newAnimationName, false);

                                    skinSpine.state.addListener({
                                        complete: (beginEvent) => {
                                            if (beginEvent.animation.name === newAnimationName) {
                                                let finalAnimation = newAnimationName.replace('Begin', 'Loop');
                                                if (!skinSpine.spineData.findAnimation(finalAnimation)) {
                                                    finalAnimation = newAnimationName.replace('Begin', 'Chant');
                                                    if (!skinSpine.spineData.findAnimation(finalAnimation)) {
                                                        return; // No valid final animation found
                                                    }
                                                }
                                                skinSpine.state.setAnimation(0, finalAnimation, true);
                                            }
                                        }
                                    });
                                    return; // Stop further execution to avoid playing two animations at once
                                }

                                // Set the new animation in a loop
                                skinSpine.state.setAnimation(0, newAnimationName, true);
                            }
                        }
                    });
                }

                if (animation.name == 'Sit') {
                    app.stage.children[0].y = app.screen.height / 1.25
                } else {
                    app.stage.children[0].y = app.screen.height
                }
            };
        });
    }

    perspectiveButton.onclick = () => {
        animationListDiv.innerHTML = ''
        animationListDiv.classList.remove('hide')
        animationListDiv.classList.add('show')
        createQuitButton(animationListDiv)

        const perspectives = ['front', 'back', 'build']
        perspectives.forEach(perspective => {
            const perspectiveButton = document.createElement('button')
            perspectiveButton.value = perspective
            perspectiveButton.textContent = perspective
            animationListDiv.append(perspectiveButton)

            perspectiveButton.onclick = () => {
                clearCanvas()
                renderCanvas(plannerId, skinName, skinsData, perspective)
            }
        });

    }

    downloadChibiButton.onclick = () => {
        let name = plannerId
        app.renderer.render(app.stage);

        const image = new Image();
        image.src = app.view.toDataURL();

        const link = document.createElement('a');
        link.href = image.src;
        link.download = `chibi-${name}`;
        link.click();
    }
}

function oldanimateText(textElement, delaySeconds = 0.1) {
    const text = textElement.textContent;

    // Clear the text element to add letters individually
    textElement.textContent = '';

    // Add each letter inside a span with a delay for animation
    text.split('').forEach((letter, index) => {
        const span = document.createElement('span');
        span.classList.add('letter');
        span.style.animationDelay = `${index * delaySeconds}s`;  // Delay each letter's animation

        // Check if the letter is a space and replace it with a non-breaking space
        span.textContent = letter === ' ' ? '\u00A0' : letter;  // \u00A0 is the non-breaking space

        textElement.appendChild(span);
    });

}

function animateText(textElement, delaySeconds = 0.1) {
    if (!textElement || !textElement.textContent.trim()) return;

    // 1. Verificamos si el ÚLTIMO hijo es una imagen
    const lastChild = textElement.lastChild;
    const hasImageAtEnd = lastChild && lastChild.nodeType === 1 && lastChild.tagName === 'IMG';

    // 2. Nos guardamos la imagen si existe y la sacamos temporalmente
    let imageElement = null;
    if (hasImageAtEnd) {
        imageElement = lastChild;
        textElement.removeChild(imageElement);
    }

    // 3. Guardamos el texto limpio (sin la imagen)
    const originalText = textElement.textContent.trim();
    textElement.textContent = ''; // limpiamos

    // 4. Animamos las letras como antes
    const letters = originalText.split('');
    letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.classList.add('letter');
        span.style.animationDelay = `${index * delaySeconds}s`;
        span.textContent = letter === ' ' ? '\u00A0' : letter;
        textElement.appendChild(span);
    });

    // 5. Calculamos cuándo termina la animación de las letras
    const lettersDuration = (letters.length - 1) * delaySeconds + 0.6; // 0.6s por la animación css

    // 6. Si había imagen, la volvemos a meter con delay extra
    if (imageElement) {
        setTimeout(() => {
            // Le ponemos la misma clase de animación que las letras (o una distinta si querés)
            imageElement.classList.add('letter');           // ← usa la misma animación
            // imageElement.classList.add('pop-in');        // ← o una animación distinta
            //imageElement.style.animationDelay = '0.3s';     // un toque más tarde que la última letra

            textElement.appendChild(imageElement);
        }, lettersDuration * 1000);
    }

    // 7. Restauramos el texto original completo después de todo
    const totalDuration = hasImageAtEnd
        ? lettersDuration + 0.9   // damos más tiempo si hay imagen
        : lettersDuration;

    setTimeout(() => {
        // Quitamos la clase 'letter' y el delay de todos los spans (letras)
        textElement.querySelectorAll('span.letter').forEach(span => {
            span.classList.remove('letter');
            span.style.animationDelay = '';   // limpiamos para que no quede rastro
            span.style.animation = 'none';    // por las dudas
        });

        // Si metimos la imagen con animación, también le sacamos todo
        if (imageElement && imageElement.parentNode) {
            imageElement.classList.remove('letter');
            imageElement.style.animationDelay = '';
            imageElement.style.animation = 'none';
        }

        textElement.classList.remove('animated'); // si usabas esta clase

    }, totalDuration * 1000 + 100);
}

function createQuitButton(animationListDiv) {
    const quitButton = document.createElement('button')
    quitButton.textContent = 'Close'
    quitButton.style.marginRight = '100%'

    quitButton.onclick = () => {
        animationListDiv.innerHTML = ''
        animationListDiv.classList.remove('show')
        animationListDiv.classList.add('hide')
    }
    animationListDiv.append(quitButton)
}

function clearCanvas() {
    if (skinSpine) {
        app.stage.removeChild(skinSpine);
        skinSpine.destroy(); // Free up resources
        skinSpine = null; // Clear reference
    }
}

function addImageInteraction(img) {
    // Image handling
    img.style.transform = 'scale(1)';
    img.style.top = '0'
    img.style.left = '0'
    img.style.transition = 'transform 0.3s ease-out'; // add transition

    // Zoom in-out
    let scale = 1;
    const minScale = 0.5;
    const maxScale = 5;
    img.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY || e.detail || e.wheelDelta;
        scale = Math.max(minScale, Math.min(maxScale, scale - 0.1 * Math.sign(delta)));
        img.style.transform = `scale(${scale})`;
    });

    // Define variables to store the starting mouse position and image position
    let startX = 0;
    let startY = 0;
    let imageX = 0;
    let imageY = 0;

    // Attach an event listener to the image to track mouse movements
    img.addEventListener('mousedown', e => {
        startX = e.clientX;
        startY = e.clientY;
        imageX = img.offsetLeft;
        imageY = img.offsetTop;
        document.addEventListener('mousemove', moveImage);
    });

    // Function to move the image
    function moveImage(e) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        img.style.left = `${imageX + deltaX}px`;
        img.style.top = `${imageY + deltaY}px`;
    }

    // Detach the event listener when the mouse button is released
    document.addEventListener('mouseup', e => {
        document.removeEventListener('mousemove', moveImage);
    });
}

function collapseOrExpand(collapseOrExpandButton) {
    const viewerInfo = document.getElementById("viewer-info");
    if (!viewerInfo) return;

    const quiereColapsar = collapseOrExpandButton.textContent.trim() === "Collapse";

    const excepciones = [
        "collapse-viewer-button",
        "animation-list-div"
    ];

    // Toggleamos los hijos (menos las excepciones)
    Array.from(viewerInfo.children).forEach(child => {
        if (excepciones.some(clase => child.classList.contains(clase))) {
            return;
        }
        if (quiereColapsar) {
            child.classList.add("hide");
        } else {
            child.classList.remove("hide");
        }
    });

    // Cambiamos tamaño del contenedor principal
    if (quiereColapsar) {
        viewerInfo.style.width = "fit-content";
        viewerInfo.style.height = "45px";
    } else {
        viewerInfo.style.width = "500px";
        viewerInfo.style.height = "100%";
    }

    // Actualizamos el texto del botón
    collapseOrExpandButton.textContent = quiereColapsar ? "Expand" : "Collapse";
}

function getTextColor(hex) {
    // Sacamos el # si lo tiene
    hex = hex.replace(/^#/, '');

    // Si es formato corto (#abc) lo expandimos a #aabbcc
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // Ahora debería ser de 6 caracteres
    if (hex.length !== 6) {
        return "#ffffff"
        throw new Error("El hex tiene que ser válido, loco (#xxx o #xxxxxx)");

    }

    // Parseamos los valores RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // La fórmula rápida que ya tenías (perceptual brightness)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    // > 125 → fondo claro → texto negro
    // ≤ 125 → fondo oscuro → texto blanco
    return brightness > 125 ? "#000000" : "#ffffff";

    //return isLightColor(hex) ? "#000000" : "#ffffff";
}

function hexToHslOld(hex, bgOrRow) {
    // Sacamos el # si viene
    hex = hex.replace(/^#/, '');

    // Expandimos si es de 3 dígitos (#abc → #aabbcc)
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }

    // RGB de 0 a 1
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // gris
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // Redondeamos a enteros
    const hue = Math.round(h * 360);
    const sat = Math.round(s * 100);
    const light = Math.round(l * 100);

    const lightnessThreshold = 60

    // Devolvemos el string listo para CSS
    //return `hsl(${hue}, ${sat}%, ${light}%)`;
    if (bgOrRow == "row") {
        if (light < lightnessThreshold) {
            return `hsl(${hue}, ${sat > 50 ? 60 : sat < 20 ? 10 : sat}%, ${light}%)`;
        } else {
            return `hsl(${hue}, ${sat}%, ${light < 80 ? 80 : light}%)`
        }
    } else {
        if (light < lightnessThreshold) {
            return `hsl(${hue}, ${sat > 25 ? 25 : 10}%, ${12.5}%, 0.8)`
        } else {
            return `hsl(${hue}, ${sat}%, 93%, 0.9)`
        }
    }

    //return `hsl(${hue}, 10.77%, 12.75%)`;
}

function hexToHsl(hex, bgOrRow) {
    // Sacamos el # si viene
    hex = hex.replace(/^#/, '');

    // Expandimos si es de 3 dígitos (#abc → #aabbcc)
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }

    // RGB de 0 a 1
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // gris
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // Redondeamos a enteros
    const hue = Math.round(h * 360);
    const sat = Math.round(s * 100);
    const light = Math.round(l * 100);
    console.log(`hsl(${hue}, ${sat}%, ${light}%)`)

    const lightnessThreshold = 50
    const darkColor = light < lightnessThreshold

    // Devolvemos el string listo para CSS
    //return `hsl(${hue}, ${sat}%, ${light}%)`;
    if (bgOrRow == "row") {
        if (darkColor) {
            return `hsl(${hue}, ${sat}%, ${light}%)`
        } else {
            return `hsl(${hue}, ${light <= 50 ? sat / 2 : sat}%, ${light <= 50 ? light * 1.5 : light}%)`
        }

    } else {
        if (darkColor) {
            return `hsl(${hue}, ${sat > 25 ? 25 : 10}%, ${light / 2}%, 0.5)`
        } else {
            return `hsl(${hue}, ${sat}%, 93%, 0.9)`
        }

    }

    //return `hsl(${hue}, 10.77%, 12.75%)`;
}

function isLightColor(hex) {
    // Sacamos el # si viene
    hex = hex.replace(/^#/, '');

    // Expandimos si es de 3 dígitos (#abc → #aabbcc)
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }

    // RGB de 0 a 1
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // gris
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    // Redondeamos a enteros
    const hue = Math.round(h * 360);
    const sat = Math.round(s * 100);
    const light = Math.round(l * 100);

    const lightnessThreshold = 50

    return light >= lightnessThreshold
}

function updateColors(color, secondaryColor) {

    const primaryColorDivs = document.querySelectorAll(".primary-color")
    primaryColorDivs.forEach(primaryColorDiv => {
        primaryColorDiv.style.background = hexToHsl(color, "row")
        primaryColorDiv.style.color = isLightColor(color) ? "#000000" : "#ffffff"
    });

    const secondaryColorDivs = document.querySelectorAll(".secondary-color")
    secondaryColorDivs.forEach(secondaryColorDiv => {
        secondaryColorDiv.style.background = hexToHsl(secondaryColor, "row")
        secondaryColorDiv.style.color = isLightColor(secondaryColor) ? "#000000" : "#ffffff"
    });

    const dynamicImgs = document.querySelectorAll(".dynamic-img-color")
    dynamicImgs.forEach(dynamicImg => {
        if (isLightColor(color)) {
            dynamicImg.style.filter = "invert()"
        } else {
            dynamicImg.style.filter = "invert(0)"
        }
    });

    const dynamicImgs2 = document.querySelectorAll(".dynamic-img-color-secondary")
    dynamicImgs2.forEach(dynamicImg => {
        if (!isLightColor(secondaryColor)) {
            dynamicImg.style.filter = "invert()"
        } else {
            dynamicImg.style.filter = "invert(0)"
        }
    });

    const chibiSaveImg = document.querySelector(".chibi-save-img")
    if (isLightColor(secondaryColor)) {
        chibiSaveImg.style.filter = "invert(0)"
    } else {
        chibiSaveImg.style.filter = "invert()"
    }


    const infoDiv = document.getElementById('viewer-info')
    infoDiv.style.backgroundColor = hexToHsl(color)

}