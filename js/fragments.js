const create = (parent, tag, text = "", classes = "", inputType = '') => {
    e = document.createElement(tag)
    if (tag !== 'img') {
        e.innerHTML = text

    }
    if (tag === "img") {
        //e.src = text; // Only set src if valid
        e.alt = text; // Consider a more descriptive alt text
        e.loading = "lazy";

    }
    if (classes !== '') e.className = classes
    if (inputType !== '') e.type = inputType
    parent.append(e)

    return e
}

const eventContainer = (eventData, skinsArray, eventRewards) => {
    const eventCode = normalizeEvent(eventData[0])
    const eventName = eventData[1]
    const eventNameEnglish = eventData[0].includes("(") && !eventData[0].includes("(rerun)")
        ? eventData[0].replace("(", "<br>(")  // Insert line break before "("
        : eventData[0];
    const eventDate = translateDateRange(eventData[3].replace(/关卡开放时间：|活动时间：/g, ''))
    const eventSkins = skinsArray.map(obj => obj.name).join(', ')
    const eventImg = eventrepo(eventCode)
    const missingEvent = {
        "link": eventData[3],
        "code": eventCode
    }

    // Elements ===========================================
    const label = document.createElement('label')
    label.className = 'event hide'
    const input = create(label, 'input', '', '', 'radio')
    input.name = 'event'
    input.value = eventCode
    input.id = eventCode
    const eventCodeDiv = create(label, 'div', eventCode, 'event-code hide')
    const eventNameDiv = create(label, 'div', eventName, 'event-name mandarin')
    const eventNameEnglishDiv = create(label, 'div', eventNameEnglish, 'event-name-english english')
    const eventDateDiv = create(label, 'div', eventDate, 'event-date hide')
    const eventSkinsDiv = create(label, 'div', eventSkins, 'event-skins hide')
    const eventImgDiv = create(label, 'img', eventImg)

    // Get the template by ID
    const template = document.getElementById("template-event-calcs");

    // Clone the content of the template
    const clone = document.importNode(template.content, true); // `true` deep clones the content
    clone.querySelector('.income').id = 'income-' + eventCode
    clone.querySelector('.expense').id = 'expense-' + eventCode
    clone.querySelector('.balance').id = 'balance-' + eventCode

    if (!eventData[0].includes("rerun")) clone.querySelector('.income').textContent = eventRewards.length > 0 ? '+' + eventRewards.length : eventRewards.length
    label.append(clone)

    label.setAttribute('data-skins', eventSkins)

    // ====================================================
    missingElementCheck(missingEvent, eventImg)
    // ====================================================

    return label
}
function getColorList(array) {
    let colorList = array.filter(color => color && color.trim() !== '');

    function fixHexColor(color) {
        if (color.length === 6) { // Checks if it's like #91335
            return color + '0'; // Adds 0, so #91335 becomes #913350
        }
        return color; // Returns unchanged if already valid
    }

    return colorList.map(fixHexColor);
}
const bg = new Image()
bg.src = "static/img/classic_gacha.png"
const rerunImg = new Image()
rerunImg.src = "static/img/replicate_warning.png"
const skinContainer = (eventData, eventSkin, skinsData, size = 'portrait', modelNameFromData = '', isRerun = false, getFromPack = false) => {
    const eventCode = normalizeEvent(eventData[0])
    const skinName = eventSkin
    const skinNameEnglish = 'No translation'
    const skinObject = findSkinByName(skinsData.cnData, skinName)
    let skinPrice = getFromPack ? "$30" : skinsData.costMap[skinName] > 0 ? skinsData.costMap[skinName] : 'Free'

    const modelName = modelNameFromData // eventSkin.operator
    const modelNameEnglish = skinObject.displaySkin.modelName
    const plannerId = skinsData.plannerIdMap[skinName]
    if (NoEffectSkins.includes(plannerId)) skinPrice = '15'
    const img = imgrepo(size, plannerId)

    const missingSkin = {
        [art]: modelName,
        [portrait]: modelName,
        [icon]: modelName,
        "plannerId": plannerId
    }
    const colors = getColorList(skinObject.displaySkin.colorList)
    // Elements ===========================================



    const label = document.createElement('label')
    label.className = 'skin hide' // hide
    label.style.border = "3px solid"
    label.style.borderImage = `linear-gradient(to right, ${colors.join(', ')}) 1`
    label.style.borderRadius = "0"
    label.style.boxShadow = "6px 6px 4px rgba(0, 0, 0, 0.7)"
    const input = create(label, 'input', '', '', 'checkbox')
    input.name = 'skin-cbox'
    input.id = eventCode + '-' + plannerId



    const width = 180
    const height = 360
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    canvas.style.position = "absolute"
    canvas.style.borderRadius = "0"

    const ctx = canvas.getContext("2d")

    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(bg, 19, 389, 276, 608, 0, 0, width, height)
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'color';



    if (colors.length === 1) {
        ctx.fillStyle = colors[0]; // Color sólido si hay un solo color
    } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, 600); // Gradiente vertical
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        ctx.fillStyle = gradient;
    }
    ctx.fillRect(0, 0, 276, 608);
    ctx.globalCompositeOperation = 'source-over'


    label.append(canvas)








    const skinNameDiv = create(label, 'div', skinName, 'skin-name mandarin hide')
    const skinNameEnglishDiv = create(label, 'div', skinNameEnglish, 'skin-name english hide')
    //const modelNameDiv = create(label, 'div', modelName, 'model-name mandarin')


    const modelNameEnglishDiv = create(label, 'div', modelNameEnglish, 'model-name english')
    modelNameEnglishDiv.style.background = "none"
    modelNameEnglishDiv.classList.add("text-outline")
    modelNameEnglishDiv.style.borderTop = "2px solid"
    modelNameEnglishDiv.style.borderImage = `linear-gradient(to right, ${colors.join(', ')}) 1`

    const bottomCanvas = document.createElement("canvas")
    bottomCanvas.width = 180
    bottomCanvas.height = 28
    bottomCanvas.style.position = 'absolute'
    bottomCanvas.style.left = '0'
    bottomCanvas.style.borderRadius = '0'
    bottomCanvas.style.zIndex = '-1'

    const bottomCtx = bottomCanvas.getContext("2d")
    bottomCtx.drawImage(bg, 538, 82, 200, 58, 0, 0, 180, 28)
    bottomCtx.globalCompositeOperation = 'color';
    if (colors.length === 1) {
        bottomCtx.fillStyle = colors[0]; // Color sólido si hay un solo color
    } else {
        const gradient = bottomCtx.createLinearGradient(0, 0, 180, 0); // Gradiente horizontal
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        bottomCtx.fillStyle = gradient;
    }
    bottomCtx.fillRect(0, 0, 180, 28); // Ajustado al tamaño del canvas
    bottomCtx.globalCompositeOperation = 'source-over';

    modelNameEnglishDiv.append(bottomCanvas)
    //modelNameEnglishDiv.style.background = `linear-gradient(to right, ${colors.join(', ')})`



    const plannerIdDiv = create(label, 'div', plannerId, 'planner-id hide')
    const imgDiv = create(label, 'img', img, 'skin-portrait')
    const eventCodeDiv = create(label, 'div', eventCode, 'hide')


    const overlay = document.createElement("div")
    overlay.classList.add("overlay")
    overlay.classList.add("text-outline")
    overlay.textContent = "Selected"
    overlay.style.userSelect = "none"
    overlay.style.opacity = "0"
    overlay.style.transitionDelay = "1s"
    overlay.style.transition = "300ms"
    overlay.style.display = "flex"
    overlay.style.justifyContent = "center"
    overlay.style.alignItems = "center"
    overlay.style.position = "absolute"
    overlay.style.background = "hsla(60, 80%, 64%, 0.3)"
    overlay.style.width = "100%"
    overlay.style.height = "100%"
    overlay.style.zIndex = "2"

    label.append(overlay)


    const skinPriceDiv = create(label, 'div', skinPrice, 'skin-price text-outline')

    if (isRerun) {
        Object.assign(skinPriceDiv.style, {
            left: '27px',
            borderRadius: '0'
        })
        const rerunCanvas = Object.assign(document.createElement("canvas"), {
            width: 35-8,
            height: 27-9
        })
        Object.assign(rerunCanvas.style, {
            position: 'absolute',
            top: '0px',
            left: '0px',
            borderRadius: '0',
            boxShadow: "6px 6px 4px rgba(0, 0, 0, 0.7)"
        })

        const rerunCtx = rerunCanvas.getContext("2d")
        rerunCtx.drawImage(rerunImg, 
            4, 0, 27, 18, 
            0, 0, rerunCanvas.width, rerunCanvas.height)
        rerunCtx.globalCompositeOperation = 'color';
        if (colors.length === 1) {
            rerunCtx.fillStyle = colors[0]; // Color sólido si hay un solo color
        } else {
            const gradient = rerunCtx.createLinearGradient(0, 0, rerunCanvas.width, 0); // Gradiente horizontal
            colors.forEach((color, index) => {
                gradient.addColorStop(index / (colors.length - 1), color);
            });
            rerunCtx.fillStyle = gradient;
        }
        rerunCtx.fillRect(0, 0, rerunCanvas.width, rerunCanvas.height); // Ajustado al tamaño del canvas
        rerunCtx.globalCompositeOperation = 'source-over';
        label.append(rerunCanvas)
    }
    const button = document.createElement('button')
    button.onclick = () => {
        showSection('viewer')
        viewer(plannerId, skinName, skinsData);
        lastSection = 'main'
    }
    button.classList.add('skin-inspect')
    create(button, 'img', inspectImg, 'skin-inspect-img')
    label.append(button)





    //const skinPriceDiv = create(label, 'div', skinPrice, 'skin-price text-outline')

    input.setAttribute('data-plannerId', plannerId)
    //input.setAttribute('data-event', eventCode)
    label.setAttribute('data-event', eventCode)
    label.setAttribute('data-model', modelNameEnglish)
    label.setAttribute('data-eventName', eventData[0])
    label.setAttribute('data-price', NoEffectSkins.includes(plannerId) ? '15' : skinsData.costMap[skinName])

    // ====================================================
    missingElementCheck(missingSkin, img)
    // ====================================================

    return label
}

const rewardContainer = (eventData, reward, elementName = 'reward-cbox', checkState = true) => {
    const eventCode = normalizeEvent(eventData[0])

    const label = document.createElement('label')
    label.className = 'reward hide' // hide
    const input = create(label, 'input', '', '', 'checkbox')
    input.name = elementName
    input.id = eventCode + '-' + reward.replace(/\s+/g, '')
    //input.className = reward

    /* This logic is incredibly dumb but at least it works T_T */

    if (eventData[0].includes("rerun") && elementName == 'all-reward-cbox') {
        reward = "Enable"
        input.checked = true
        checkedCboxStyle(input, false)
    }

    if (eventData[0].includes("rerun") && elementName == 'reward-cbox') {
        input.checked = false
    }
    if (!eventData[0].includes("rerun") && elementName == 'reward-cbox') {
        input.checked = checkState
        if (checkState) checkedCboxStyle(input, false)
    }



    // if (!eventData[0].includes("rerun")) input.checked = checkState
    //if (checkState && !eventData[0].includes("rerun")) checkedCboxStyle(input, false)
    create(label, 'div', reward, '')

    label.setAttribute('data-event', eventCode)

    return label
}

const summaryRow = (eventId, planners, eventName) => {
    const row = document.createElement('div')
    row.classList.add('summary-row')
    //create(row, 'div', eventId)

    const eventDiv = document.createElement('div')
    eventDiv.classList.add('summary-event')

    create(eventDiv, 'div', eventName, 'name')
    //create(eventDiv, 'img', eventrepo(eventId))
    const summaryEventImage = document.createElement("img")
    summaryEventImage.src = eventrepo(eventId)

    eventDiv.append(summaryEventImage)

    row.append(eventDiv)

    planners.forEach(planner => {
        const skinDiv = document.createElement('div')
        skinDiv.classList.add('summary-skin')

        create(skinDiv, 'div', planner.modelName, 'name')
        const summarySkinImage = document.createElement("img")
        summarySkinImage.src = imgrepo('icon', planner.plannerId)
        skinDiv.append(summarySkinImage)
        //create(skinDiv, 'img', imgrepo('icon', planner.plannerId))


        row.append(skinDiv)
    });

    return row
}

const gallerySkin = (skinsData, data) => {
    const skinName = data.name
    const skinObject = findSkinByName(skinsData.cnData, data.name)
    const button = document.createElement('button')
    //button.classList.add('show-block')
    const modelName = ""
    const modelNameEnglish = data.plannerId // skinObject.displaySkin.modelName
    //console.log(data.plannerId)
    const plannerId = data.plannerId
    const img = imgrepo('icon', plannerId)

    let skinGroupId = skinObject.displaySkin.skinGroupId.split('#')[1]
    if (skinGroupId == "as") skinGroupId = "ambienceSynesthesia"
    const brand = skinsData.cnData.brandList[skinGroupId]?.brandCapitalName || 'CROSSOVER'

    button.setAttribute('data-brand', brand)

    create(button, 'div', modelNameEnglish, 'gallery-name')
    create(button, 'img', img)



    button.onclick = () => {
        showSection('viewer')
        viewer(plannerId, skinName, skinsData);
        lastSection = 'gallery'
    }

    // ====================================================
    //missingElementCheck(missingSkin, img)
    // ====================================================

    return button
}


