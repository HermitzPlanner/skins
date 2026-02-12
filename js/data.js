const missingAssets = []
let fetchedEventsData
let fetchedOperatorsData

function parseSkinsData(cnData, enData) {
    const charSkins = Object.entries(cnData.charSkins);
    charSkins.sort((a, b) => a[1].displaySkin.getTime - b[1].displaySkin.getTime);

    const plannerIdMap = {}
    const plannerIdMapGlobal = {}
    const costMap = {}
    const brands = new Set()
    const artistsUnordered = new Set()

    const obtainApproaches = new Set()
    const missingChibis = []

    charSkins.forEach(element => {
        const skin = element[1];

        const obtainApproach = skin.displaySkin.obtainApproach
        const avatarId = skin.avatarId

        let modelName = skin.displaySkin.modelName
        const skinName = skin.displaySkin.skinName
        if (skinName == '触及星辰' || skinName == '于万千宇宙之中') modelName = 'Amiya Guard'
        if (skinName == '寰宇独奏') modelName = 'Amiya Medic'

        const skinGroupId = skin.displaySkin.skinGroupId
        if (skinGroupId) {
            let skinGroupIdSplitted = skinGroupId.split('#')[1]
            //if (skinGroupIdSplitted == "as") skinGroupIdSplitted = "ambienceSynesthesia" 
            const brand = cnData.brandList[skinGroupIdSplitted]?.brandCapitalName || 'CROSSOVER'
            brands.add(brand)
        }

        if (skin.displaySkin.drawerList) {
            artistsUnordered.add(skin.displaySkin.drawerList.join(', '))
        }
        //console.log("skin.displaySkin.drawerList",skin.displaySkin.drawerList)
        //const artist = skin.displaySkin.drawerList[0]
        //if (artist) { artists.add(artist) }






        if (obtainApproach) {
            obtainApproaches.add(obtainApproach);
        }

        if (skin.displaySkin.skinName) {
            // let price = obtainApproach == '采购中心' ? 18 : 0
            // if (skin.dynIllustId) price = 21
            // if (skin.dynEntranceId) price = 24
            let price = 0
            if (obtainApproach == '采购中心') {
                price = 18
                if (skin.dynIllustId) price = 21
                if (skin.dynEntranceId) price = 24
            }
            plannerIdMap[skin.displaySkin.skinName] = getPlannerId(modelName);
            costMap[skin.displaySkin.skinName] = price
        }
    });

    console.log("Unique obtainApproaches:", Array.from(obtainApproaches));

    const artists = new Set(
        [...artistsUnordered].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
    );

    return { cnData, enData, plannerIdMap, costMap, brands, artists }
}

function parseEventsData(data) {

    const groups = [];
    let currentGroup = [];

    data.split('\n').forEach(line => {
        if (line.trim() === '') { // Empty line means new group
            if (currentGroup.length > 0) {
                groups.push(currentGroup);
                currentGroup = [];
            }
        } else {
            currentGroup.push(line.trim());
        }
    });

    if (currentGroup.length > 0) { // Push last group if not empty
        groups.push(currentGroup);
    }

    fetchedEventsData = groups
    return groups
}

// ====================================================
// Fetch repos, thank you Kengxxiao
// ====================================================

Promise.all([
    // Fetch CN skin data
    fetch('https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/refs/heads/master/zh_CN/gamedata/excel/skin_table.json')
        .then(response => response.json()),

    // Fetch EN skin data
    fetch('https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData_YoStar/refs/heads/main/en_US/gamedata/excel/skin_table.json')
        .then(response => response.json()),

    // Fetch events data
    fetch('static/data.txt')
        .then(response => response.text()),
]).then(([cnData, enData, eventsData]) => {
    const skinsData = parseSkinsData(cnData, enData);
    const parsedEventsData = parseEventsData(eventsData);
    main(skinsData, parsedEventsData);
}).catch(error => {
    console.error('Error fetching data:', error);
});


function main(skinsData, eventsData) {
    console.log("skinsData", skinsData)
    console.log("eventsData", eventsData)
    eventsData.slice().reverse().forEach((event, index) => {

        let eventSkins = [];
        let eventRewards = []

        event.forEach(item => {
            if (item.startsWith("◆")) {
                const match = item.match(/◆【.*】系列 - (.*?) - (.*)/);
                if (match) {
                    eventSkins.push({
                        name: match[1],      // Extracted skin name
                        operator: match[2],   // Extracted operator name
                        isRerun: false,
                        getFromPack: false
                    });
                }
            }
            if (item.startsWith("◆r")) {
                const match = item.match(/◆r【.*】系列 - (.*?) - (.*)/);
                if (match) {
                    eventSkins.push({
                        name: match[1],      // Extracted skin name
                        operator: match[2],   // Extracted operator name
                        isRerun: true,
                        getFromPack: false
                    });
                }
            }
            if (item.startsWith("◆p")) {
                const match = item.match(/◆p【.*】系列 - (.*?) - (.*)/);
                if (match) {
                    eventSkins.push({
                        name: match[1],      // Extracted skin name
                        operator: match[2],   // Extracted operator name
                        isRerun: false,
                        getFromPack: true
                    });
                }
            }
            if (item.startsWith("◆rp")) {
                const match = item.match(/◆rp【.*】系列 - (.*?) - (.*)/);
                if (match) {
                    eventSkins.push({
                        name: match[1],      // Extracted skin name
                        operator: match[2],   // Extracted operator name
                        isRerun: true,
                        getFromPack: true
                    });
                }
            }

            if (item.startsWith('[')) {
                //console.log("item", item)
                const arr = JSON.parse(item);
                eventRewards = arr
                //console.log("eventRewards", eventRewards)
            }
        });

        const containerOfEvents = getDiv('container-of-events')
        const containerOfSkins = getDiv('container-of-skins')
        const containerOfRewards = getDiv('container-of-rewards')

        const eventDiv = eventContainer(event, eventSkins, eventRewards)

        eventDiv.style.animationDelay = `${index * 25}ms`; // Adjust timing as needed
        eventDiv.classList.add('show-grid')

        containerOfEvents.append(eventDiv)

        eventRewards.forEach(reward => {
            containerOfRewards.append(rewardContainer(event, reward))
        });

        if (eventRewards.length !== 0) containerOfRewards.append(rewardContainer(event, 'Disable', 'all-reward-cbox', false))

        eventSkins.forEach(eventSkin => {
            containerOfSkins.append(skinContainer(event, eventSkin.name, skinsData, 'portrait', eventSkin.operator, eventSkin.isRerun, eventSkin.getFromPack))
        });

        if (event[0].startsWith('fashion')) {
            // Extract only the first number from "fashion review X (extra text)"
            const match = event[0].match(/\d+/);
            const maxFashionReview = match ? parseInt(match[0], 10) : 0;

            Object.keys(fashionReview)
                .map(Number) // Convert keys to numbers
                .filter(review => review <= maxFashionReview) // Keep only numbers ≤ maxFashionReview
                .sort((a, b) => b - a) // Sort for consistency
                .forEach(review => {
                    fashionReview[review].forEach(fashionSkin => {
                        containerOfSkins.append(skinContainer(event, fashionSkin, skinsData, 'icon'));
                    });
                });
        }




    });

    //if (missingAssets.length !== 0) 
    console.warn("Missing Assets:", missingAssets)

    //document.getElementById('default-language').click()
    eventButtonsLogic()
    skinButtonsLogic()
    rewardButtonsLogic()
    updateCalcs();

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

    document.querySelector('input[name="event"]').click()

    const search = document.getElementById('search2')
    const search3 = document.getElementById('search3')
    const brandData = skinsData.brands
    const artistsData = skinsData.artists
    //brandData.sort();
    brandData.forEach(brand => {
        search.innerHTML += `<option value="${brand}">${brand}</option>`
    });

    artistsData.forEach(artist => {
        search3.innerHTML += `<option value="${artist}">${artist}</option>`
    });

    let selectedBrand = ''

    search.addEventListener("change", brand => {
        selectedBrand = search.value
        revealItem()
    })

    let selectedArtist = ''

    search3.addEventListener("change", artist => {
        selectedArtist = search3.value
        revealItem()
    })


    const plannerIds = Object.entries(skinsData.plannerIdMap).map(([name, plannerId]) => ({ name, plannerId }));
    debug(plannerIds)
    plannerIds.slice().reverse().forEach(plannerId => {
        // if (plannerId.plannerId.includes("amiya")) console.log(plannerId)
        getDiv('gallery-skins').append(gallerySkin(skinsData, plannerId))
    });


    let searchTerm = ""

    document.getElementById('search').addEventListener('input', function () {
        searchTerm = this.value.toLowerCase().trim();
        //debug({ searchTerm })
        revealItem()
    });

    function revealItem() {

        const buttons = document.querySelectorAll('#gallery-skins button');

        buttons.forEach(button => {
            const itemName = button.querySelector('.gallery-name').textContent.toLowerCase().trim()
            itemName.includes(searchTerm) ? visible(button) : invis(button);
            // const itemName = container.querySelector('.h2').textContent.toLowerCase().trim();
            // const itemSlot = container.getAttribute('data-slot')
            // const itemRarity = container.getAttribute('data-rarity')
            // const itemCategory = container.getAttribute('data-category')

            // const labelElement = container.parentElement

            // itemName.includes(searchTerm) ? visible(labelElement) : invis(labelElement);

            // Look only for the current visible items

            /*
            if (button.classList.contains('show-block')) {
                const shouldBeVisible = (button.getAttribute('data-brand') == selectedBrand || selectedBrand == 'all' || selectedBrand == '')
                //need to check for
                //button.getAttribute('data-artist') == selectedArtist || selectedArtist == 'all' || selectedArtist == ''
                shouldBeVisible ? visible(button) : invis(button);
            }
            */

            if (button.classList.contains('show-block')) {
                const brandMatch = (
                    button.getAttribute('data-brand') === selectedBrand ||
                    selectedBrand === 'all' ||
                    selectedBrand === ''
                );

                const artistMatch = (
                    button.getAttribute('data-artist') === selectedArtist ||
                    selectedArtist === 'all' ||
                    selectedArtist === ''
                );

                const shouldBeVisible = brandMatch && artistMatch;

                shouldBeVisible ? visible(button) : invis(button);
            }

        });
    }


    setLocalStorage()

    setupImageObserver();
}

function eventButtonsLogic() {
    document.querySelectorAll('input[name="event"]').forEach(radio => {
        const eventCode = radio.value
        const eventName = radio.parentElement.querySelector('.event-name').textContent
        const eventNameEnglish = radio.parentElement.querySelector('.event-name-english').textContent
        radio.addEventListener("click", () => {
            document.querySelectorAll('input[name="event"]').forEach(uncheckedCboxStyle)
            checkedCboxStyle(radio)
            resetAll('.skin');
            resetAll('.reward');
            revealIfElementMatchesEvent(eventCode)

            //getDiv('container-of-skins-h2-english').textContent = eventNameEnglish
            //getDiv('container-of-skins-h2-mandarin').textContent = eventName


            /*
            getDiv('container-of-skins').style.backgroundImage =
                `linear-gradient(var(--gradient-top-transparent), 
            var(--gradient-bottom-transparent)), 
            url("https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/events/${eventCode}.jpg")`
            */
                        
            
                        getDiv('container-of-skins').style.backgroundImage =
                            `linear-gradient(var(--gradient-top-transparent), 
                        var(--gradient-bottom-transparent)), 
                        url("https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/event-bg/${eventCode}.jpg")`
            
                        



            // getDiv('container-of-skins').style.backgroundImage =
            //     `linear-gradient(var(--gradient-top-transparent), 
            // var(--gradient-bottom-transparent)), 
            // url("../static/img/static_back.png")`

            /* ??????? */
            const container = getDiv('container-of-rewards')
            const visibleDivs = container.querySelectorAll('label:not(.hide)').length
            if (visibleDivs == 0) {
                container.classList.add('hide');  // Add "hide" if only 1 or 0 visible divs
            } else {
                container.classList.remove('hide'); // Remove "hide" if more than 1 visible div
            }

        })
    });
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



function updateCalcs(element) {
    if (element?.name == "skin-cbox") {
        const skinEvent = element.parentElement.getAttribute('data-event')
        const price = parseInt(element.parentElement.getAttribute('data-price'))

        const expenseDiv = getDiv(`expense-${skinEvent}`)
        const expenseValue = getValue(expenseDiv)

        expenseDiv.textContent = parseInt(expenseValue + (element.checked ? -price : price));
    }

    if (element?.name == 'reward-cbox') {
        const rewardEvent = element.parentElement.getAttribute('data-event')

        const incomeDiv = getDiv(`income-${rewardEvent}`)
        const incomeValue = getValue(incomeDiv)

        if (element.checked) {
            incomeDiv.textContent = parseInt(incomeValue + 1) > 0 ? '+' + parseInt(incomeValue + 1) : parseInt(incomeValue + 1)
        } else {
            incomeDiv.textContent = parseInt(incomeValue - 1) > 0 ? '+' + parseInt(incomeValue - 1) : parseInt(incomeValue - 1)
        }
    }

    const initial = parseInt(getDiv('initial').value)
    let previousBalance = initial

    document.querySelectorAll('.balance').forEach(balance => {
        const calcsDiv = balance.parentElement.parentElement

        const incomeDiv = calcsDiv.querySelector('.income')
        const incomeValue = getValue(incomeDiv)

        const expenseDiv = calcsDiv.querySelector('.expense')
        const expenseValue = getValue(expenseDiv)

        const balanceValue = parseInt(incomeValue + expenseValue + previousBalance)
        balance.textContent = balanceValue
        balance.style.color = balanceValue < 0 ? 'red' : ''

        previousBalance = parseInt(incomeValue + expenseValue + previousBalance)
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
                    img.src = 'assets/yu.png'; // Optional: Set a fallback image
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


