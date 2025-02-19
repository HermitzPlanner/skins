const create = (parent, tag, text = "", classes = "", inputType = '') => {
    e = document.createElement(tag)
    if (tag !== 'img') {
        e.innerHTML = text
        
    }
    if (tag === "img") {
        e.src = text;
        e.alt = text;
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

const skinContainer = (eventData, eventSkin, skinsData, size = 'portrait') => {
    const eventCode = normalizeEvent(eventData[0])
    const skinName = eventSkin
    const skinNameEnglish = 'No translation'
    const skinObject = findSkinByName(skinsData.cnData, skinName)
    let skinPrice = skinsData.costMap[skinName] > 0 ? skinsData.costMap[skinName] : 'Free'
    
    //const modelName = eventSkin.operator
    const modelNameEnglish = skinObject.displaySkin.modelName
    const plannerId = skinsData.plannerIdMap[skinName]
    if (NoEffectSkins.includes(plannerId)) skinPrice = '15'
    const img = imgrepo(size, plannerId)

    const missingSkin = {
        [art]: 'modelName',
        [portrait]: 'modelName',
        [icon]: 'modelName',
        "plannerId": plannerId
    }

    // Elements ===========================================

    const label = document.createElement('label')
    label.className = 'skin hide' // hide
    const input = create(label, 'input', '', '', 'checkbox')
    input.name = 'skin-cbox'
    input.id = eventCode + '-' + plannerId
    const skinNameDiv = create(label, 'div', skinName, 'skin-name mandarin hide')
    const skinNameEnglishDiv = create(label, 'div', skinNameEnglish, 'skin-name english hide')
    //const modelNameDiv = create(label, 'div', modelName, 'model-name mandarin')
    const modelNameEnglishDiv = create(label, 'div', modelNameEnglish, 'model-name english')
    const plannerIdDiv = create(label, 'div', plannerId, 'planner-id hide')
    const imgDiv = create(label, 'img', img, 'skin-portrait')
    const eventCodeDiv = create(label, 'div', eventCode, 'hide')
    const skinPriceDiv = create(label, 'div', skinPrice, 'skin-price text-outline')
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
    create(eventDiv, 'img', eventrepo(eventId))

    row.append(eventDiv)

    planners.forEach(planner => {
        const skinDiv = document.createElement('div')
        skinDiv.classList.add('summary-skin')

        create(skinDiv, 'div', planner.modelName, 'name')
        create(skinDiv, 'img', imgrepo('icon', planner.plannerId))


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
    const modelNameEnglish = skinObject.displaySkin.modelName
    const plannerId = data.plannerId
    const img = imgrepo('icon', plannerId)

    const skinGroupId = skinObject.displaySkin.skinGroupId
    const brand = skinsData.cnData.brandList[skinGroupId.split('#')[1]]?.brandCapitalName || 'CROSSOVER'

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


