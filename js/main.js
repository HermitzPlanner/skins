import { fetchGameData } from "./fetch.js"
import { checkedCboxStyle, uncheckedCboxStyle, resetAll, revealIfElementMatchesEvent, findSkinByName, getColorList, checkedSkin, uncheckedSkin, getEditionFromTimestamp, showSection, drawSkinBackground, drawSkinBottomBackground } from "./utils.js"
import { NO_EFFECT_SKINS, RESIZED_EVENT_REPOSITORY, SKIN_ICON_REPOSITORY, SKIN_PORTRAIT_REPOSITORY, CERT_SKINS } from "./constants.js";
import { viewer } from "./viewer.js";
import { gallery, galleryLogic } from "./gallery.js";
import { summary } from "./summary.js";
import { skinTable } from "./skin-table.js";
import { setLocalStorage } from "./local-storage.js";

export let EVENTS_DATA = ""
export let lastSection = 'main'



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

export const missingAssets = []

fetchGameData().then(data => {

    // ────────✦───────✦───────✦────────
    //  skinsData, eventsData, charData
    // ────────✦───────✦───────✦────────

    EVENTS_DATA = data.eventsData

    console.log('Exported data:', data);


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
                    renderPlannerSkin(eventSkin, event, data, 'portrait-size')
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

    console.warn("Missing Assets:", missingAssets)

    setLocalStorage()
    setupImageObserver();

}).catch(error => {
    console.error('Error:', error);
});

function renderPlannerSkin(eventSkin, event, data, size = "portrait-size") {

    const template = document.getElementById('planner-skin-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('label').setAttribute('data-event', event.code)
    clone.querySelector('label').setAttribute('data-model', eventSkin.modelNameEnglish)
    clone.querySelector('label').setAttribute('data-eventName', event.nameEnglish)
    clone.querySelector('label').style.borderImage = `linear-gradient(to right, ${eventSkin.colors.join(', ')}) 1`
    clone.querySelector('label').setAttribute('data-price', NO_EFFECT_SKINS.includes(eventSkin.plannerId) ? '15' : data.skinsData.costMap[eventSkin.name])
    clone.querySelector('input').setAttribute('data-plannerId', eventSkin.plannerId)
    clone.querySelector('input').id = event.code + '-' + eventSkin.plannerId
    clone.querySelector('.skin-name.mandarin').textContent = eventSkin.name
    clone.querySelector('.skin-name.english').textContent = eventSkin.nameEnglish
    //clone.querySelector('.model-name.mandarin').textContent = eventSkin.modelName
    clone.querySelector('.model-name.english').textContent = eventSkin.modelNameEnglish
    clone.querySelector('.model-name.english').style.borderImage = `linear-gradient(to right, ${eventSkin.colors.join(', ')}) 1`
    clone.querySelector('.planner-id').textContent = eventSkin.plannerId
    clone.querySelector('.skin-portrait').alt = size == 'portrait-size' ? SKIN_PORTRAIT_REPOSITORY(eventSkin.plannerId) : SKIN_ICON_REPOSITORY(eventSkin.plannerId)
    clone.querySelector('.planner-skin-event-code').textContent = event.code
    clone.querySelector('.skin-price').textContent = eventSkin.price
    clone.querySelector('button').onclick = () => {
        showSection('viewer')
        viewer(eventSkin.plannerId, eventSkin.name, data.skinsData, data.charData);
        lastSection = 'main'
    }

    drawSkinBackground(clone.querySelector('canvas'), eventSkin)
    drawSkinBottomBackground(clone.querySelector('.planner-skin-name-canvas'), eventSkin)

    document.getElementById('container-of-skins').append(clone)

    /*
    const art = "立绘"
    const icon = "头像"
    const portrait = "半身像"
    */

    const missingSkin = {
        ["立绘"]: eventSkin.modelName.replace("升变状态", "").replace(/（/g, "(").replace(/）/g, ")"),
        ["半身像"]: eventSkin.modelName.replace("升变状态", "").replace(/（/g, "(").replace(/）/g, ")"),
        ["头像"]: eventSkin.modelName.replace("升变状态", "").replace(/（/g, "(").replace(/）/g, ")"),
        "plannerId": eventSkin.plannerId
    }

    missingElementCheck(missingSkin, SKIN_PORTRAIT_REPOSITORY(eventSkin.plannerId))
}

function renderFashionSkins(data, event) {
    let lastYear = 0
    function getYearFromTimestamp(timestamp) {

        return new Date(timestamp * 1000).getFullYear();
    }




    const fashionNumber = event.nameEnglish.split(' ').pop()
    const skinsData = data.skinsData.cnData.charSkins
    //const sortedDataSkins = Object.entries(skinsData)
    //    .sort(([, a], [, b]) => a.displaySkin.getTime - b.displaySkin.getTime)
    //    .map(([key, skin]) => skin);

    let counter = 0

    const sortedDataSkins = Object.entries(skinsData)
        .sort(([, a], [, b]) => b.displaySkin.getTime - a.displaySkin.getTime)
        .map(([key, skin]) => skin);

    Object.entries(sortedDataSkins).forEach(([key, value]) => {
        if (!value.isBuySkin) return
        const displaySkin = value.displaySkin
        if (displaySkin.skinName == '十字郡' || CERT_SKINS.includes(displaySkin.skinName)) return
        const getTime = displaySkin.getTime
        const year = getYearFromTimestamp(getTime)
        const edition = getEditionFromTimestamp(getTime);
        const skinGroupId = displaySkin.skinGroupId
        const brand = data.skinsData.cnData.brandList[skinGroupId?.split('#')[1]]?.brandCapitalName || 'CROSSOVER'
        const crossoverSkinsThatAreFashion = [
            '漆黑热浪',
            '无言狂响',
            '爆裂菲林',
            '乌萨斯IO79',
            '自由//失效',
            '惬意'
        ]
        if (brand == 'CROSSOVER' && !crossoverSkinsThatAreFashion.includes(displaySkin.skinName)) return

        let price = 0
        if (displaySkin.obtainApproach == '采购中心') {
            price = 18
            if (value.dynIllustId) price = 21
            if (value.dynEntranceId) price = 24
        }

        if (displaySkin.skinName == '惬意') price = 18

        if (price !== 18) return
        if (edition == 0) return
        if (edition > fashionNumber) return

        if (year !== lastYear) {
            //planner-brand-template
            const templateYear = document.getElementById('planner-brand-template');
            const cloneYear = templateYear.content.cloneNode(true);

            if (counter > 0) {
                cloneYear.querySelector('.break').style.outline = '1px dashed #ffffff38'
                cloneYear.querySelector('.break').style.margin = '15px 0'
            }
            counter++
            cloneYear.querySelector(".planner-brand-name").remove() //.textContent = "eventSkin.name"
            cloneYear.querySelector(".planner-brand-type").innerHTML = 'Year ' + (year - 2019) + '<br>' + year
            cloneYear.querySelector(".planner-brand-image").remove()
            //clone.querySelector(".planner-brand-image").src = `static/img/brands/${eventSkin.name}.png`
            cloneYear.querySelector('.planner-brand').style.setProperty('--bg-url', `url('')` /* `url('${bgLink2}.jpg')`*/)

            cloneYear.querySelector(".planner-brand").setAttribute('data-event', event.code)



            cloneYear.querySelector(".break").setAttribute('data-event', event.code)
            document.getElementById("container-of-skins").appendChild(cloneYear)
        }

        lastYear = year

        const skinName = displaySkin.skinName

        if (skinName == '守岁人') console.log(value)
        const plannerId = data.skinsData.plannerIdMap[skinName]
        const colors = getColorList(displaySkin.colorList)
        const modelNameEnglish = displaySkin.modelName

        const template = document.getElementById('planner-skin-template');
        const clone = template.content.cloneNode(true);

        // ────────✦───────✦───────✦────────✦────────✦────────✦────────✦────────✦────────
        // Copypasted from renderPlannerSkin, quick fix for now. merge both in the future
        // ────────✦───────✦───────✦────────✦────────✦────────✦────────✦────────✦────────

        clone.querySelector('label').setAttribute('data-event', event.code)
        clone.querySelector('label').setAttribute('data-model', modelNameEnglish)
        clone.querySelector('label').setAttribute('data-eventName', event.nameEnglish)
        clone.querySelector('label').style.border = '0px solid'
        clone.querySelector('label').style.borderRadius = '10px'
        clone.querySelector('label').style.borderImage = `linear-gradient(to right, ${colors.join(', ')}) 1`
        clone.querySelector('label').setAttribute('data-price', NO_EFFECT_SKINS.includes(plannerId) ? '15' : data.skinsData.costMap[skinName])
        clone.querySelector('input').setAttribute('data-plannerId', plannerId)
        clone.querySelector('input').id = event.code + '-' + plannerId
        clone.querySelector('.skin-name.mandarin').textContent = skinName
        //clone.querySelector('.model-name.mandarin').textContent = modelName
        clone.querySelector('.model-name.english').textContent = modelNameEnglish
        clone.querySelector('.model-name.english').style.padding = '0'
        clone.querySelector('.model-name.english').style.color = '#fff'
        clone.querySelector('.model-name.english').style.border = '0px' // Image = `linear-gradient(to right, ${colors.join(', ')}) 1`
        clone.querySelector('.model-name.english').style.background = '#000000d6'
        clone.querySelector('.planner-id').textContent = plannerId

        //clone.querySelector('.skin-portrait').style.position = 'relative'
        //clone.querySelector('.skin-portrait').style.transform = 'translateY(-20px)'
        clone.querySelector('.skin-portrait').alt = SKIN_ICON_REPOSITORY(plannerId)

        clone.querySelector('.planner-skin-event-code').textContent = event.code
        clone.querySelector('.skin-price').textContent = price
        clone.querySelector('.planner-skin-name-canvas').remove()
        clone.querySelector('button').onclick = () => {
            showSection('viewer')
            viewer(plannerId, skinName, data.skinsData, data.charData, edition);
            lastSection = 'main'
        }

        const eventSkin = {
            width: 180,
            height: 360,
            colors: colors
        }

        drawSkinBackground(clone.querySelector('canvas'), eventSkin)
        //drawSkinBottomBackground(clone.querySelector('.planner-skin-name-canvas'), eventSkin)



        document.getElementById("container-of-skins").appendChild(clone);

    });
}

function headerButtonsLogic(data) {
    document.getElementById('header-summary-button').onclick = () => { summary() }
    document.getElementById("header-gallery-checkbox").onclick = () => { gallery() }
    // document.getElementById('skin-table').onclick = () => { skinTable(data) }
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
    clone.querySelector('img').alt = RESIZED_EVENT_REPOSITORY(event.code)
    clone.querySelector('.income').id = 'income-' + event.code
    clone.querySelector('.expense').id = 'expense-' + event.code
    clone.querySelector('.balance').id = 'balance-' + event.code
    clone.querySelector('.event').style.animationDelay = `${index * 25}ms`; // Adjust timing as needed
    clone.querySelector('.event').classList.add('show-grid')
    clone.querySelector('.income').textContent = event.nameEnglish.includes("rerun") ? 0 : "+" + event.rewards.length
    //if (!eventData[0].includes("rerun")) clone.querySelector('.income').textContent = eventRewards.length > 0 ? '+' + eventRewards.length : eventRewards.length


    document.getElementById('container-of-events').append(clone)
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

    clone.querySelector(".planner-brand").setAttribute('data-event', event.code)



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


            document.getElementById('container-of-skins').scrollTo({
                top: 0,
                behavior: 'smooth'     // 'auto' o 'instant' si no querés animación
            });

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
    const images = document.querySelectorAll('img[alt]:not(.svg):not(.planner-brand-image)'); // Select all images with alt text

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                // Only set src if alt is a valid URL (basic validation)
                if (img.alt && isValidUrl(img.alt)) {
                    img.src = img.alt;
                } else {
                    console.warn(`Invalid URL in alt text for image: ${img.alt}, ${entry}`);
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

function missingElementCheck(missingElement, link) {
    const img = new Image(); // Create an image object
    img.src = link;

    img.onerror = () => {
        missingAssets.push(missingElement);
    };
}
