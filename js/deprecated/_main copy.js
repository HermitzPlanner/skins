import { fetchGameData } from "./_fetch.js"
import { checkedCboxStyle, uncheckedCboxStyle, resetAll, revealIfElementMatchesEvent, findSkinByName, getColorList, checkedSkin, uncheckedSkin, getEditionFromTimestamp, showSection } from "./_utils.js"
import { NO_EFFECT_SKINS, RESIZED_EVENT_REPOSITORY, SKIN_ICON_REPOSITORY, SKIN_PORTRAIT_REPOSITORY } from "./_constants.js";
import { viewer } from "./_viewer.js";
import { gallery, galleryLogic } from "./_gallery.js";
import { summary } from "./_summary.js";
import { skinTable } from "./_skin-table.js";

export let EVENTS_DATA = ""
export let lastSection = 'main'

const bg = new Image()
bg.src = "static/img/classic_gacha.png"
const rerunImg = new Image()
rerunImg.src = "static/img/replicate_warning.png"

// ────────✦───────✦───────✦────────✦────────
// Attach event listeners to show sections
// ────────✦───────✦───────✦────────✦────────
document.querySelectorAll(".toggle-button").forEach(button => {
    button.addEventListener("click", function () {

        const target = this.getAttribute("data-target");
        showSection(target);
    });
});

showSection("main");

// ────────✦───────✦───────✦────────✦────────
// Create divs util. To be deprecated soon.
// ────────✦───────✦───────✦────────✦────────

const create = (parent, tag, text = "", classes = "", inputType = '') => {
    const e = document.createElement(tag)
    if (tag !== 'img') {
        e.innerHTML = text

    }
    if (tag === "img") {
        //e.src = text; // Only set src if valid
        e.alt = text; // Consider a more descriptive alt text
        //e.loading = "lazy";

    }
    if (classes !== '') e.className = classes
    if (inputType !== '') e.type = inputType
    parent.append(e)

    return e
}

// TODO: Re-implement missing assets
const missingAssets = []

fetchGameData().then(data => {

    // ────────✦───────✦───────✦────────
    //  skinsData, eventsData, charData
    // ────────✦───────✦───────✦────────

    EVENTS_DATA = data.eventsData

    console.log('Exported data:', data);
    console.warn("Missing Assets:", missingAssets)

    data.eventsData.slice().reverse().forEach((event, eventIndex) => {

        renderEvent(data, event, eventIndex)

        if (event.nameEnglish.startsWith('Fashion')) {

            renderFashionSkins(data, event)

        } else {
            renderStagesList(event.rewards, event)
            event.skins.forEach((eventSkin, skinIndex) => {
                if (eventSkin.isBrand) {
                    renderBrandLogos(skinIndex, eventSkin, event)
                } else {
                    renderPlannerSkin(eventSkin, event, data)
                    //document.getElementById("container-of-skins").append(skinContainer(event, eventSkin.name, data.skinsData, 'portrait', eventSkin.operator, eventSkin.isRerun, eventSkin.getFromPack, data.charData))
                }
            });
        }

    });

    eventButtonsLogic()
    skinButtonsLogic()
    rewardButtonsLogic()
    updateCalcs()
    initialPrimesLogic()
    galleryButton()
    galleryLogic(data)
    headerButtonsLogic(data)

    document.querySelector('input[name="event"]').click()
    const meow = document.createElement('div')
    meow.textContent = 'meow'

    Object.assign(meow.style, {
        "position": "absolute",
        "right": "9px",
        "opacity": "0.07"
    })

    document.querySelector('input[name="event"]').parentElement.append(meow)

    // TODO: re-implement local storage
    //setLocalStorage()
    setupImageObserver();

}).catch(error => {
    console.error('Error:', error);
});

function renderPlannerSkin(eventSkin, event, data) {

    const skinObject = findSkinByName(data.skinsData.cnData, eventSkin.name)

    const template = document.getElementById('planner-skin-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('input').setAttribute('data-plannerId', eventSkin.plannerId)
    clone.querySelector('label').setAttribute('data-event', event.code)
    clone.querySelector('label').setAttribute('data-model', "modelNameEnglish")
    clone.querySelector('label').setAttribute('data-eventName', event.nameEnglish)
    //clone.querySelector('label').setAttribute('data-price', NO_EFFECT_SKINS.includes(plannerId) ? '15' : skinsData.costMap[skinName])



    clone.querySelector('.skin-portrait').src = SKIN_PORTRAIT_REPOSITORY(plannerId)

    document.getElementById('container-of-skins').append(clone)
}

function renderFashionSkins(data, event) {
    const fashionNumber = event.nameEnglish.split(' ').pop()
    const skinsData = data.skinsData.cnData.charSkins
    const sortedDataSkins = Object.entries(skinsData)
        .sort(([, a], [, b]) => a.displaySkin.getTime - b.displaySkin.getTime)
        .map(([key, skin]) => skin);   // si solo querés los objetos

    Object.entries(sortedDataSkins).forEach(([key, value]) => {
        if (!value.isBuySkin) return
        const displaySkin = value.displaySkin
        const getTime = displaySkin.getTime
        const edition = getEditionFromTimestamp(getTime);
        const skinGroupId = displaySkin.skinGroupId
        const brand = data.skinsData.cnData.brandList[skinGroupId?.split('#')[1]]?.brandCapitalName || 'CROSSOVER'
        if (brand == 'CROSSOVER') return

        let price = 0
        if (displaySkin.obtainApproach == '采购中心') {
            price = 18
            if (value.dynIllustId) price = 21
            if (value.dynEntranceId) price = 24
        }

        if (price !== 18) return
        if (edition == 0) return
        if (edition > fashionNumber) return

        const skinName = displaySkin.skinName
        const plannerId = data.skinsData.plannerIdMap[skinName]

        const template = document.getElementById('fashion-review-skin-template');
        const clone = template.content.cloneNode(true);

        clone.querySelector('img').src = SKIN_ICON_REPOSITORY(plannerId)
        clone.querySelector('img').setAttribute('data-event', event.code)


        document.getElementById("container-of-skins").appendChild(clone);

    });
}

function headerButtonsLogic(data) {
    document.getElementById('header-summary-button').onclick = () => { summary() }
    document.getElementById('skin-table').onclick = () => { skinTable(data) }
}

function galleryButton() {
    document.getElementById("header-gallery-checkbox").onclick = () => { gallery() }
}

function renderEvent(data, event, index) {
    const template = document.getElementById('event-container-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('input').value = event.code
    clone.querySelector('input').id = event.code
    clone.querySelector('.event-code').textContent = event.code
    clone.querySelector('.event-name').textContent = event.nameMandarin
    clone.querySelector('.event-name-english').textContent = event.nameEnglish
    clone.querySelector('.event-date').textContent = event.date
    clone.querySelector('.event-skins').textContent = event.skins
    clone.querySelector('img').src = RESIZED_EVENT_REPOSITORY(event.code)
    clone.querySelector('.income').id = 'income-' + event.code
    clone.querySelector('.expense').id = 'expense-' + event.code
    clone.querySelector('.balance').id = 'balance-' + event.code
    clone.querySelector('.event').style.animationDelay = `${index * 25}ms`; // Adjust timing as needed
    clone.querySelector('.event').classList.add('show-grid')
    clone.querySelector('.income').textContent = event.nameEnglish.includes("rerun") ? 0 : "+" + event.rewards.length
    //if (!eventData[0].includes("rerun")) clone.querySelector('.income').textContent = eventRewards.length > 0 ? '+' + eventRewards.length : eventRewards.length


    document.getElementById('container-of-events').append(clone)
}


const skinContainer = (event, eventSkin, skinsData, size = 'portrait', modelNameFromData = '', isRerun = false, getFromPack = false, charData) => {
    const eventCode = event.code
    const skinName = eventSkin
    const skinNameEnglish = 'No translation'
    const skinObject = findSkinByName(skinsData.cnData, skinName)
    let skinPrice = getFromPack ? "$30" : skinsData.costMap[skinName] > 0 ? skinsData.costMap[skinName] : 'Free'

    const modelName = modelNameFromData // eventSkin.operator
    const modelNameEnglish = skinObject.displaySkin.modelName
    const plannerId = skinsData.plannerIdMap[skinName]
    if (NO_EFFECT_SKINS.includes(plannerId)) skinPrice = '15'
    const img = `https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/${size}/${plannerId}.png`

    /*
    const missingSkin = {
        [art]: modelName.replace("升变状态", "").replace(/（/g, "(").replace(/）/g, ")"),
        [portrait]: modelName.replace("升变状态", "").replace(/（/g, "(").replace(/）/g, ")"),
        [icon]: modelName.replace("升变状态", "").replace(/（/g, "(").replace(/）/g, ")"),
        "plannerId": plannerId
    }
    */
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
            width: 35 - 8,
            height: 27 - 9
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
        viewer(plannerId, skinName, skinsData, charData);
        lastSection = 'main'
    }
    button.classList.add('skin-inspect')
    create(button, 'img', 'https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/search.svg', 'skin-inspect-img')
    label.append(button)





    //const skinPriceDiv = create(label, 'div', skinPrice, 'skin-price text-outline')

    input.setAttribute('data-plannerId', plannerId)
    //input.setAttribute('data-event', eventCode)
    label.setAttribute('data-event', eventCode)
    label.setAttribute('data-model', modelNameEnglish)
    label.setAttribute('data-eventName', event.nameEnglish)
    label.setAttribute('data-price', NO_EFFECT_SKINS.includes(plannerId) ? '15' : skinsData.costMap[skinName])

    // ====================================================
    //missingElementCheck(missingSkin, img)
    // ====================================================

    return label
}

function renderBrandLogos(index, eventSkin, event) {
    const template = document.getElementById('planner-brand-template');
    const clone = template.content.cloneNode(true);
    const bgLink = `https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/event-bg/${event.code}`
    const bgLink2 = `https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/events/${event.code}`
    const outfitAmount = eventSkin.isMultiple ? "outfits" : "outfit";

    clone.querySelector(".planner-brand-name").textContent = eventSkin.name
    clone.querySelector(".planner-brand-type").innerHTML = eventSkin.isRerun ? `rerun <br> ${outfitAmount}` : `new <br> ${outfitAmount}`
    clone.querySelector(".planner-brand-image").src = `static/img/brands/${eventSkin.name}.png`
    clone.querySelector('.planner-brand').style.setProperty('--bg-url', `url('')` /* `url('${bgLink2}.jpg')`*/)
    clone.querySelector(".planner-brand").classList.add("hide")
    clone.querySelector(".planner-brand").setAttribute('data-event', event.code)



    clone.querySelector(".break").classList.add("hide")
    clone.querySelector(".break").setAttribute('data-event', event.code)

    let nextBrand = null;
    let i = index > 0 ? index - 1 : 0;

    while (i < event.skins.length) {
        if (event.skins[i].isBrand) {
            nextBrand = event.skins[i];
            break;
        }
        i--;
    }

    if (nextBrand !== null) {
        if (!eventSkin.isMultiple && !nextBrand.isMultiple && eventSkin.name !== nextBrand.name) {
            clone.querySelector(".break").remove()
        }
    }



    document.getElementById('container-of-skins').append(clone)

}

function updateCalcs(element) {
    console.log("updating calcs")
    if (element?.name == "skin-cbox") {
        const skinEvent = element.parentElement.getAttribute('data-event')
        const price = parseInt(element.parentElement.getAttribute('data-price'))

        const expenseDiv = document.getElementById(`expense-${skinEvent}`)
        const expenseValue = parseInt(expenseDiv.textContent)

        expenseDiv.textContent = parseInt(expenseValue + (element.checked ? -price : price));
    }

    if (element?.name == 'reward-cbox') {
        const rewardEvent = element.parentElement.getAttribute('data-event')

        const incomeDiv = document.getElementById(`income-${rewardEvent}`)
        const incomeValue = parseInt(incomeDiv.textContent)

        if (element.checked) {
            incomeDiv.textContent = parseInt(incomeValue + 1) > 0 ? '+' + parseInt(incomeValue + 1) : parseInt(incomeValue + 1)
        } else {
            incomeDiv.textContent = parseInt(incomeValue - 1) > 0 ? '+' + parseInt(incomeValue - 1) : parseInt(incomeValue - 1)
        }
    }

    const initial = parseInt(document.getElementById('initial').value)
    let previousBalance = initial

    document.querySelectorAll('.balance').forEach(balance => {
        const calcsDiv = balance.parentElement.parentElement

        const incomeDiv = calcsDiv.querySelector('.income')
        const incomeValue = parseInt(incomeDiv.textContent)

        const expenseDiv = calcsDiv.querySelector('.expense')
        const expenseValue = parseInt(expenseDiv.textContent)

        const balanceValue = parseInt(incomeValue + expenseValue + previousBalance)
        balance.textContent = balanceValue
        balance.style.color = balanceValue < 0 ? 'red' : ''

        previousBalance = parseInt(incomeValue + expenseValue + previousBalance)
    });
}

function eventButtonsLogic() {
    document.querySelectorAll('input[name="event"]').forEach(radio => {
        const eventCode = radio.value
        const eventName = radio.parentElement.querySelector('.event-name').textContent
        const eventNameEnglish = radio.parentElement.querySelector('.event-name-english').textContent
        radio.addEventListener("click", () => {
            console.log("click")
            document.querySelectorAll('input[name="event"]').forEach(uncheckedCboxStyle)
            checkedCboxStyle(radio)
            resetAll('.skin');
            resetAll('.planner-brand')
            resetAll('.reward');
            resetAll('.break')
            revealIfElementMatchesEvent(eventCode)

            //getDiv('container-of-skins-h2-english').textContent = eventNameEnglish
            //getDiv('container-of-skins-h2-mandarin').textContent = eventName


            /*
            getDiv('container-of-skins').style.backgroundImage =
                `linear-gradient(var(--gradient-top-transparent), 
            var(--gradient-bottom-transparent)), 
            url("https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/events/${eventCode}.jpg")`
            */


            document.getElementById('container-of-skins').style.backgroundImage =
                `linear-gradient(var(--gradient-top-transparent), 
                        var(--gradient-bottom-transparent)), 
                        url("https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/event-bg/${eventCode}.jpg")`





            // getDiv('container-of-skins').style.backgroundImage =
            //     `linear-gradient(var(--gradient-top-transparent), 
            // var(--gradient-bottom-transparent)), 
            // url("../static/img/static_back.png")`

            /* ??????? */

            // const brandImage = document.createElement("img")
            // brandImage.src = "static/img/brands/CROSSOVER.png"
            // getDiv('container-of-skins').append(brandImage)


            const container = document.getElementById('container-of-rewards')
            const visibleDivs = container.querySelectorAll('label:not(.hide)').length
            if (visibleDivs == 0) {
                container.classList.add('hide');  // Add "hide" if only 1 or 0 visible divs
            } else {
                container.classList.remove('hide'); // Remove "hide" if more than 1 visible div
            }

        })
    });
}

function initialPrimesLogic() {
    const input = document.getElementById('initial');

    // Keep the existing input event listener
    input.addEventListener('input', updateCalcs);

    // Add keydown event listener for arrow keys
    input.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault(); // Prevent default scrolling

            // Get current value as a number, default to 0 if empty or invalid
            let value = parseFloat(input.value) || 0;

            // Increment or decrement by 1, but don't go below 0
            if (event.key === 'ArrowUp') {
                value += 1;
            } else if (event.key === 'ArrowDown' && value > 0) {
                value -= 1;
            }

            // Update the input value
            input.value = value;

            // Trigger updateCalcs
            updateCalcs();
        }
    });
}

function renderStagesList(eventRewards, event) {
    eventRewards.forEach(reward => {
        const template = document.getElementById('stage-reward-template');
        const clone = template.content.cloneNode(true);

        clone.querySelector('label').className = 'reward hide' // hide
        clone.querySelector('input').name = 'reward-cbox'
        clone.querySelector('input').id = event.code + '-' + reward.replace(/\s+/g, '')
        clone.querySelector('.stage-name').textContent = reward
        clone.querySelector('label').setAttribute('data-event', event.code)

        /* This logic is incredibly dumb but at least it works T_T */

        if (event.nameEnglish.includes("rerun")) {
            clone.querySelector('input').checked = false
        }
        if (!event.nameEnglish.includes("rerun")) {
            clone.querySelector('input').checked = true
            checkedCboxStyle(clone.querySelector('input'), false)
        }


        document.getElementById('container-of-rewards').append(clone)
    });

    if (eventRewards.length !== 0) {

        const template = document.getElementById('stage-reward-template');
        const clone = template.content.cloneNode(true);

        clone.querySelector('label').className = 'reward all-reward-cbox hide' // hide
        // mark checked as false
        clone.querySelector('input').name = 'all-reward-cbox'
        clone.querySelector('input').checked = event.nameEnglish.includes("rerun") ? true : false
        if (event.nameEnglish.includes("rerun")) checkedCboxStyle(clone.querySelector('input'), false)
        //clone.querySelector('input').name = 'Disable'
        //clone.querySelector('input').id = event.code + '-' + reward.replace(/\s+/g, '')
        clone.querySelector('.stage-name').textContent = event.nameEnglish.includes("rerun") ? 'Enable' : 'Disable'
        clone.querySelector('label').setAttribute('data-event', event.code)

        document.getElementById('container-of-rewards').append(clone)

        /* 
        if (event.nameEnglish.includes("rerun") && elementName == 'all-reward-cbox') {
            reward = "Enable"
            input.checked = true
            checkedCboxStyle(input, false)
        }
            */

    }
}

function rewardButtonsLogic() {
    document.querySelectorAll('input[name="reward-cbox"]').forEach(cbox => {
        cbox.addEventListener('click', () => {
            cbox.checked ? checkedCboxStyle(cbox, false) : uncheckedCboxStyle(cbox, false)
            updateCalcs(cbox)
        })
    });

    document.querySelectorAll('input[name="all-reward-cbox"]').forEach(allReward => {
        const allRewardEvent = allReward.parentElement.getAttribute('data-event')
        allReward.addEventListener('click', () => {
            console.log("all reward clicked")
            allReward.checked ? checkedCboxStyle(allReward) : uncheckedCboxStyle(allReward)

            document.querySelectorAll('input[name="reward-cbox"]').forEach(reward => {
                const rewardEvent = reward.parentElement.getAttribute('data-event')

                if (allReward.checked) {
                    allReward.nextElementSibling.textContent = "Enable"
                    if (rewardEvent == allRewardEvent && reward.checked) {
                        reward.click()
                    }
                } else {
                    allReward.nextElementSibling.textContent = "Disable"
                    if (rewardEvent == allRewardEvent && !reward.checked) {
                        reward.click()
                    }
                }
            });
        })
    });

}

function skinButtonsLogic() {
    document.querySelectorAll('input[name="skin-cbox"]').forEach(cbox => {
        cbox.addEventListener('click', () => {
            cbox.checked ? checkedSkin(cbox.parentElement) : uncheckedSkin(cbox.parentElement)
            //cbox.checked ? checkedCboxStyle(cbox, true, true) : uncheckedCboxStyle(cbox)
            updateCalcs(cbox)
        })
    });
}




// IntersectionObserver to set src when image is visible
function setupImageObserver() {
    const images = document.querySelectorAll('img[alt]:not(.svg)'); // Select all images with alt text

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Only set src if alt is a valid URL (basic validation)
                if (img.alt && isValidUrl(img.alt)) {
                    img.src = img.alt;
                } else {
                    console.warn(`Invalid URL in alt text for image: ${img.alt}`);
                    //img.src = 'assets/yu.png'; // Optional: Set a fallback image
                }
                observer.unobserve(img); // Stop observing once src is set
            }
        });
    }, {
        root: null, // Use viewport as root
        rootMargin: '0px', // Trigger when image is fully in view
        threshold: 0.1 // Trigger when 10% of the image is visible
    });

    images.forEach(img => observer.observe(img));
}
// Basic URL validation (you can enhance this)
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
