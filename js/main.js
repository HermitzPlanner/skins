import { fetchGameData } from "./fetch.js"
import { renderSkins } from "./render-skins.js";
import { checkedCboxStyle, uncheckedCboxStyle, checkedButtonStyle, uncheckedButtonStyle, resetAll, revealIfElementMatchesEvent, findSkinByName, getColorList, checkedSkin, uncheckedSkin, getEditionFromTimestamp, showSection, drawSkinBackground, drawSkinBottomBackground, setLightness, missingElementCheck, revealFashion } from "./utils.js"
import { RESIZED_EVENT_REPOSITORY } from "./constants.js";

import { gallery, galleryLogic } from "./gallery.js";
import { summary } from "./summary.js";

import { setLocalStorage } from "./local-storage.js";
import { renderBanners } from "./render-banners.js";

import { skinTable } from "./skin-table.js";

export let EVENTS_DATA = ""
export let lastSection = 'planner'

const isMobile = navigator.userAgentData?.mobile === true
    || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

console.log(isMobile ? "Estás en un móvil" : "Estás en PC o tablet grande");

document.getElementById('container-of-skins').style.display = isMobile ? 'none' : 'flex'

if (isMobile) {
    const mobileToggles = document.querySelectorAll('.mobile-toggle')
    mobileToggles.forEach(element => {
        element.style.display = 'flex'
    });

    document.getElementById("gallery").style.flexDirection = 'column'

    document.getElementById("header-summary-button").style.padding = '2px 20px'
    document.getElementById("header-summary-button").style.height = ("-webkit-fill-available")
    document.getElementById("header-summary-button").style.alignItems = ("center")
    document.getElementById("header-show-skins-button").style.padding = '2px 20px'
    document.getElementById("header-show-skins-button").style.height = ("-webkit-fill-available")
    document.getElementById("header-show-skins-button").style.alignItems = ("center")

    const galleryHeader = document.querySelector('.gallery-header')
    galleryHeader.style.width = '100%';
    galleryHeader.style.alignItems = 'center';
    galleryHeader.style.flexDirection = 'row';
    galleryHeader.style.overflowX = 'scroll'

    const initialRow = document.querySelector('.initial-row')
    initialRow.style.position = 'sticky'
    initialRow.style.zIndex = '2'
    initialRow.style.top = '0'
    initialRow.style.backdropFilter = 'blur(5px)'
    initialRow.style.background = '#000000bd'
    initialRow.style.borderRadius = '10px'

    document.getElementById('initial-primes-text').style.top = '3px'

    document.getElementById('container-of-skins').style.paddingTop = '5px'
    document.getElementById('container-of-events').style.paddingTop = '5px'
}



// ────────✦───────✦───────✦────────✦────────
// Attach event listeners to show sections
// ────────✦───────✦───────✦────────✦────────
document.querySelectorAll(".toggle-button").forEach(button => {
    button.addEventListener("click", function () {

        const target = this.getAttribute("data-target");
        showSection(target);
    });
});

showSection("planner");

export const missingAssets = []
const planBanners = false

fetchGameData().then(data => {

    // ────────✦───────✦───────✦────────
    //  skinsData, eventsData, charData
    // ────────✦───────✦───────✦────────

    EVENTS_DATA = data.eventsData

    console.log('Exported data:', data);

    let stopInFirstElement = false

    data.eventsData.slice().reverse().forEach((event, eventIndex) => {
        if (stopInFirstElement) return
        if (event.rateUps.sixStars && planBanners) {
            renderEvent(data, event, eventIndex)
            renderBanners(data, event)
        }

        if (planBanners == false) {
            renderStagesList(event.rewards, event)
            renderEvent(data, event, eventIndex)
            renderSkins(data, event)
        }

        //stopInFirstElement = true
    });

    eventButtonsLogic()
    skinButtonsLogic()
    rewardButtonsLogic()
    updateCalcs()
    initialPrimesLogic()
    galleryLogic(data)
    headerButtonsLogic(data)

    const yearFilterButtons = document.querySelectorAll('.year-filter-button')
    yearFilterButtons.forEach(yearFilterButton => {
        yearFilterButton.onclick = () => {
            console.log("%cYear Filter", "background: #28a745; color: white; padding: 4px 12px; border-radius: 4px; font-size: 16px;");

            resetAll('.skin')
            resetAll('.year-filter-button')
            document.querySelectorAll('.year-filter-button').forEach(uncheckedButtonStyle)
            checkedButtonStyle(yearFilterButton)
            document.getElementById("fashion-year").textContent = yearFilterButton.value
            revealFashion(document.getElementById("current-event-code").textContent)
        }
    });

    document.querySelector('input[name="event"]').click()

    if (isMobile) document.getElementById('container-of-skins').appendChild(document.getElementById('container-of-rewards'))

    const meow = document.createElement('div')
    meow.textContent = 'meow'

    Object.assign(meow.style, {
        "position": "absolute",
        "right": "9px",
        "opacity": "0.05"
    })

    document.querySelector('input[name="event"]').parentElement.append(meow)

    console.warn("Missing Assets:", missingAssets)

    setLocalStorage()
    setupImageObserver();


    // Cuando todo termina → quitamos el loader
    document.body.classList.remove("loading");
    document.body.classList.add("loaded");

    // Opción más fancy: fade out del overlay
    const overlay = document.getElementById("loader-overlay");
    overlay.classList.add("hidden");

    // Opcional: quitarlo del DOM después de la transición
    setTimeout(() => {
        overlay.remove();
    }, 500);

}).catch(error => {
    console.error('Error:', error);
});





function headerButtonsLogic(data) {
    document.getElementById('header-summary-button').onclick = () => { summary(data) }
    document.getElementById("header-gallery-checkbox").onclick = () => { gallery() }
    // document.getElementById('skin-table').onclick = () => { skinTable(data) }
}

function renderEvent(data, event, index) {
    const template = document.getElementById('event-container-template');
    const clone = template.content.cloneNode(true);

    clone.querySelector('label').style.setProperty('--bg-url', `url('https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/events/resized/resized_${event.code}.jpg')`)

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
            document.querySelectorAll('.year-filter-button').forEach(uncheckedButtonStyle)
            document.getElementById("year-button-filters").style.display = eventNameEnglish.includes("Fashion Review") ? "flex" : "none"
            document.getElementById("button-filter-2024").style.display = eventNameEnglish.includes("Fashion Review 18") ? "block" : "none"
            document.getElementById("container-of-skins").style.justifyContent = eventNameEnglish.includes("Fashion Review") ? "center" : "left"

            document.getElementById("current-event-code").textContent = eventCode
            document.querySelectorAll('input[name="event"]').forEach(uncheckedCboxStyle)
            checkedCboxStyle(radio)
            resetAll('.skin');
            resetAll('.planner-brand')
            resetAll('.reward');
            resetAll('.break')
            revealIfElementMatchesEvent(eventCode)

            const eventBackground = `https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/event-bg/${eventCode}.jpg`
            const eventImage = `https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/events/${eventCode}.jpg`

            document.getElementById('planner').style.backgroundImage =
                `linear-gradient(var(--gradient-top-transparent), var(--gradient-bottom-transparent)), url("${eventBackground}")`

            const img = new Image(); // Create an image object
            img.src = eventBackground;

            img.onerror = () => {
                document.getElementById('planner').style.backgroundImage =
                    `linear-gradient(var(--gradient-top-transparent), var(--gradient-bottom-transparent)), url("${eventImage}")`
            };

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

                    const linkTest = new Image(); // Create an image object
                    linkTest.src = img.alt;

                    if (img.parentElement.classList.contains('event')) {
                        img.parentElement.classList.add('animate-event-pop')
                    }

                    linkTest.onerror = () => {
                        if (img.classList.contains('gallery-icon')) img.src = "static/img/missing.png"
                    };
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



function doesThisLinkWorks(link) {
    const img = new Image(); // Create an image object
    img.src = link;

    img.onerror = () => {
        console.log("img doesn't work")
        return false
    };

    return true
}
