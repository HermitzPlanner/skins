let lastSection = 'main'

function viewer(plannerId, skinName, skinsData) {
    resetDiv('viewer');
    clearCanvas()
    const container = getDiv('viewer');

    //if (!plannerId.includes('0')) {
    artRender(container, plannerId)
    if (!plannerId.includes('0')) infoRender(container, plannerId, skinName, skinsData)
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


function infoRender(container, plannerId, skinName, skinsData) {
    const skinObject = findSkinByName(skinsData.cnData, skinName)
    debug(skinObject)
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
    const colorList = skinObject.displaySkin.colorList

    let price = skinsData.costMap[skinName] > 0 ? skinsData.costMap[skinName] : 'Free'
    if (plannerId == "thorns1") price = 18
    if (NoEffectSkins.includes(plannerId)) price = '15'

    const infoDiv = document.createElement('div')
    infoDiv.id = 'viewer-info'

    // ====================================================
    // Header Div
    // ====================================================

    const quitViewerButton = document.createElement('button')
    quitViewerButton.textContent = 'X'
    quitViewerButton.classList.add('quit-viewer-button')
    quitViewerButton.onclick = () => {
        // document.getElementById('viewer').style.display = 'none'
        //getDiv(lastSection).style.display = 'flex'
        showSection(lastSection)
    }

    infoDiv.append(quitViewerButton)

    const header = document.createElement('div')
    header.className = 'viewer-header'

    const iconDiv = create(header, 'img', imgrepo('icon', plannerId), 'viewer-icon-image')
    animate(iconDiv, 'viewer-show-image')

    function getTextColor(hex) {
        // Sacamos el # si lo tiene
        hex = hex.replace(/^#/, '');

        // Si es formato corto (#abc) lo expandimos a #aabbcc
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }

        // Ahora debería ser de 6 caracteres
        if (hex.length !== 6) {
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
    }

    // rgb(118, 41, 42) → brightness ≈ 68 → devuelve blanco

    const modelNameDiv = create(header, 'div', skinObject.displaySkin.modelName, 'viewer-model-name')
    console.log("colorList[0]", colorList[0])
    //modelNameDiv.style.background = colorList[0]
    //modelNameDiv.style.color = getTextColor(colorList[0])
    if (modelNameDiv.length > 1) modelNameDiv.style.fontSize = '35px'
    animateText(modelNameDiv)

    const skinNameDiv = create(header, 'div', skinNameGlobal, 'viewer-skin-name')
    //skinNameDiv.style.background = colorList[0]
    //skinNameDiv.style.color = getTextColor(colorList[0])
    //skinNameDiv.style.fontSize = '50px'
    animateText(skinNameDiv, 0.05)

    infoDiv.append(header)

    // ====================================================
    // Color List Div
    // ====================================================

    const colorListDiv = document.createElement('div');
    colorListDiv.className = 'color-list-div';
    let colorStyles = [];

    colorList.forEach(color => {
        if (color.trim() !== '') { // Skip empty strings
            const colorDiv = document.createElement('div');
            colorDiv.style.backgroundColor = color;
            colorDiv.style.flex = '1'; // Each color div takes equal width
            colorListDiv.appendChild(colorDiv);

            // Convert hex to rgba with 10% opacity
            colorStyles.push(hexToRgba(color, 0.1));
        }
    });

    infoDiv.append(colorListDiv);

    // Apply the gradient with transparent colors
    let angle = 45; // Change this to any angle (0-360)
    let gradient = `linear-gradient(${angle}deg, ${colorStyles.join(', ')})`;
    // let gradient = `radial-gradient(circle, ${colorStyles.join(', ')})`;

    getDiv('viewer').style.background = gradient;

    // ====================================================
    // Canvas for the chibi
    // ====================================================
    createCanvasDiv(infoDiv, plannerId, skinName, skinsData)

    // ====================================================
    // Information Rows
    // ====================================================

    const infoRows = document.createElement('div')
    infoRows.className = 'info-rows'

    const priceText = price == 'Free' ? 'Free Skin' : 'Price: ' + price

    const skinPriceDiv = create(infoRows, 'div', priceText, 'viewer-row')
    animateText(skinPriceDiv, 0.05)
    if (price > 0) {
        /*
        const originiteImage = document.createElement('img')
        originiteImage.src = originiteLink
        skinPriceDiv.append(originiteImage)
        animate(originiteImage, 'viewer-show-image')
        */
    }


    const artistDiv = create(infoRows, 'div', 'Artist: ' + artist, 'viewer-row')
    animateText(artistDiv)
    const obtainDiv = create(infoRows, 'div', obtainApproach, 'viewer-row')
    animateText(obtainDiv)
    const brandDiv = create(infoRows, 'div', brand, 'viewer-row')
    animateText(brandDiv)
    const cnReleaseDiv = create(infoRows, 'div', 'CN Release: ' + cnRelease, 'viewer-row')
    animateText(cnReleaseDiv)
    const enReleaseDiv = create(infoRows, 'div', enRelease == 'Not released' ? enRelease + ' in Global' : 'EN Release: ' + enRelease, 'viewer-row')
    animateText(enReleaseDiv)

    // ====================================================
    // Upcoming Events Div
    // ====================================================
    // create(infoRows, 'div', 'Upcoming events: ', 'viewer-row-double')
    upcomingEvents.forEach(upcomingEvent => {
        const div = create(infoRows, 'div', '', 'viewer-row-double')
        const cartImage = document.createElement('img')
        cartImage.style.filter = 'invert()'
        cartImage.style.marginLeft = '0'
        cartImage.style.marginRight = '5px'
        cartImage.src = cartLink
        div.append(cartImage)
        animate(cartImage, 'viewer-show-image')
        div.append(upcomingEvent)

    });

    // const hideInfoDiv = document.createElement("button");
    // hideInfoDiv.textContent = "Amogsdjlkdsf";
    // hideInfoDiv.onclick = function () {
    //     infoDiv.style.width = "0px"
    // };
    // infoRows.append(hideInfoDiv)

    infoDiv.append(infoRows)

    if (videos[plannerId]) {

        //videos[plannerId].forEach(videoFile => {
        for (let index = 1; index <= videos[plannerId]; index++) {


            const video = document.createElement("video");
            video.src = `https://github.com/HermitzPlanner/chibi-effects/raw/refs/heads/main/${plannerId}/${index}.mp4`;
            video.autoplay = true
            video.controls = true;            // barra de play/pausa/tiempo/fullscreen
            video.muted = true;               // para que autoplay funcione sin bronca del navegador
            video.autoplay = true;           // ponelo true si querés que arranquen solos (pero muteados)
            video.loop = true;             // si querés que se repitan
            video.preload = "metadata";       // carga solo metadata al principio (más rápido)

            // video.style.maxWidth = "600px";   // ajustá como quieras
            // video.style.margin = "12px";
            video.style.borderRadius = "8px";
            video.style.boxShadow = "0 4px 10px rgba(0,0,0,0.3)"; // para que queden zarpados

            infoDiv.appendChild(video);
        }
        //});
    }





    // const video = document.createElement("video")
    // video.autoplay = true;       // descomentá si querés que arranque solo (mejor con muted)
    // video.muted = true;             // para que autoplay funcione en la mayoría de navegadores
    // video.loop = true;              // repite forever
    // const source = document.createElement('source');
    // source.src = 'static/ling2/g0omz8Pflx08vblOTvss010412001ez20E010.mp4';  // cambiá por tu ruta o URL
    // source.type = 'video/mp4';

    // // La metés adentro del video
    // video.appendChild(source);



    container.append(infoDiv)

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

function createCanvasDiv(infoDiv, plannerId, skinName, skinsData) {
    const canvas = document.createElement('div')
    canvas.className = 'viewer-canvas'

    const chibiButtons = document.createElement('div')
    chibiButtons.className = 'chibi-buttons hide'
    const changeSkinButton = create(chibiButtons, 'button', "Change Skin", 'chibi-row')
    const animationListButton = create(chibiButtons, 'button', "Animation List", 'chibi-row')
    const perspectiveButton = create(chibiButtons, 'button', "Perspective", 'chibi-row')

    const saveSvg = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/save.svg"
    const downloadChibiButton = create(chibiButtons, 'button', "", 'chibi-row')

    const saveDiv = document.createElement("img") //create(downloadChibiButton, 'img', saveSvg)
    saveDiv.src = saveSvg
    saveDiv.className = 'svg'
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
                viewer(match, matchSkinName, skinsData)
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
    if (!textElement || !textElement.textContent) return; // Skip invalid or empty elements

    const originalText = textElement.textContent.trim(); // Store original text
    textElement.textContent = ''; // Clear text for animation

    // Add each letter inside a span with a delay for animation
    const letters = originalText.split('');
    letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.classList.add('letter');
        span.style.animationDelay = `${index * delaySeconds}s`;
        span.textContent = letter === ' ' ? '\u00A0' : letter; // Non-breaking space for spaces
        textElement.appendChild(span);
    });

    // Calculate total animation duration (last letter's delay + animation duration)
    const totalDuration = (letters.length - 1) * delaySeconds + 0.5; // Adjust 0.5s to match your CSS animation duration

    // Restore original text after animation completes
    setTimeout(() => {
        textElement.textContent = originalText; // Revert to plain text
        textElement.classList.remove('animated'); // Optional: Remove animation class if used
    }, totalDuration * 1000); // Convert to milliseconds
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
