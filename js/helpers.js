const getDiv = id => document.getElementById(id);
const getValue = div => parseInt(div.textContent)
function getKeyByValue(obj, value) {
    return Object.keys(obj).find(key => obj[key] === value) || null;
}
const resetDiv = id => document.getElementById(id).innerHTML = ""
const debug = console.log

function translateDateRange(chineseText, year = new Date().getFullYear()) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return chineseText.replace(/(\d{2})月(\d{2})日 (\d{2}:\d{2})/g, (_, month, day, time) => {
        return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year} at ${time}`;
    }).replace(/-/g, ' to ');
}

function findSkinByName(skinsData, skinName) {
    for (const key in skinsData.charSkins) {
        if (skinsData.charSkins[key].displaySkin.skinName === skinName) {
            return skinsData.charSkins[key]; // Return the matching object
        }
    }
    return null; // Return null if no match is found
}

function findSkinByAvatar(skinsData, avatar) {
    for (const key in skinsData.charSkins) {
        if (skinsData.charSkins[key].avatarId === avatar) {
            return skinsData.charSkins[key]; // Return the matching object
        }
    }
    return null; // Return null if no match is found
}

const contentMap = {}

const normalize = (string) => string.replace(/[-.0123456789'" ()#]/g, "").toLowerCase()
const normalizeEvent = (string) => {
    return string
        .replace('ü', 'u')
        .replace('contingency contract battleplan', 'ccb')
        .replace(/[-.'" ()#]/g, "")
        .toLowerCase()
}
const normalizeName = (string) => altersMap[string] || string

const getPlannerId = (string) => {

    let plannerId = normalize((altersMap[string] || string))

    if (contentMap.hasOwnProperty(plannerId)) {
        // If it exists, increment the count and update the element's content
        contentMap[plannerId]++;
        plannerId = `${plannerId}${contentMap[plannerId]}`;
    } else {
        // If it doesn't exist, initialize the count to 1
        contentMap[plannerId] = 1;
        plannerId = `${plannerId}1`;
    }

    return plannerId;
}


function missingElementCheck(missingElement, link) {
    const img = new Image(); // Create an image object
    img.src = link;

    img.onerror = () => {
        missingAssets.push(missingElement);
    };
}

/*
function toggleLanguage() {
    if (!document.querySelector('input[name="language"]:checked')) return
    const selected = document.querySelector('input[name="language"]:checked').value;

    document.querySelectorAll('.english').forEach(el => {
        el.style.display = selected === 'english' ? 'block' : 'none';
    });

    document.querySelectorAll('.mandarin').forEach(el => {
        el.style.display = selected === 'mandarin' ? 'block' : 'none';
    });
}

document.querySelectorAll('input[name="language"]').forEach(input => {
    input.addEventListener('change', toggleLanguage);
});

// Run once on page load to set initial state
toggleLanguage();
*/


function checkedCboxStyle(cbox, enableGlow = true, enableText = false) {
    cbox.parentElement.style.border = "1px solid var(--accent)";
    cbox.parentElement.style.background = "var(--accent-bg)";
    cbox.parentElement.style.background = `linear-gradient(to bottom, var(--gradient-top), var(--gradient-bottom))`;
    if (enableText) cbox.parentElement.style.color = "var(--accent)";
    if (enableGlow) cbox.parentElement.style.boxShadow = "0px 0px 10px 2px var(--accent-bg)";
}

function uncheckedCboxStyle(cbox) {
    cbox.parentElement.style.border = "";
    cbox.parentElement.style.background = "";
    cbox.parentElement.style.boxShadow = "";
    cbox.parentElement.style.color = "";
}

function resetAll(selector) {
    document.querySelectorAll(selector).forEach(element => {
        if (element.classList.contains('show')) {
            element.classList.remove('show');
            element.classList.add('hide');

            // setTimeout(() => {
            //     element.classList.remove('show'); // Remove after 0.5s
            // }, 500);
        }
    });
}

function revealIfElementMatchesEvent(eventCode) {
    document.querySelectorAll('[data-event]').forEach(element => {
        const skinEvent = element.getAttribute('data-event')
        if (eventCode == skinEvent) {
            if (!element.classList.contains('show')) {
                element.classList.add('show');
                element.classList.remove('hide');
            }
        }
    });
}

// function getEventListByName(skinName) {
//     console.log("fetchedEventsData", fetchedEventsData);

//     const matchedEvents = fetchedEventsData
//         .filter(eventData => eventData.slice(1).some(data => data.includes(skinName))) // Check all except first item
//         .map(eventData => eventData[0]); // Extract event name (first item)

//     return matchedEvents.join(', '); // Return as comma-separated string
// }

function getEventListByName(skinName) {
    console.log("fetchedEventsData", fetchedEventsData);

    const matchedEvents = fetchedEventsData
        .filter(eventData => eventData.slice(1).some(data => data.includes(skinName))) // Check all except first item
        .map(eventData => eventData[0]); // Extract event name (first item)

    return matchedEvents.length > 0 ? matchedEvents : ["No upcoming event"]; // Return array or default message
}

// Example usage:
//getEventListByName("SomeSkin").then(console.log);


function getReleaseTime(getTime) {
    if (!getTime) return 'Not released'
    let timestampCN = getTime;
    let dateCN = new Date(timestampCN * 1000);
    let yearCN = dateCN.getFullYear();
    let monthCN = String(dateCN.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    let dayCN = String(dateCN.getDate()).padStart(2, '0');
    return yearCN + '-' + monthCN + '-' + dayCN;
}

function getMatchingPlannerIds(plannerId, skinsData) {
    let matches = [];

    // Extract the base name and number from plannerId
    let match = plannerId.match(/^(.*?)(\d+)$/);
    if (!match) return matches;

    let baseName = match[1];
    let baseNumber = parseInt(match[2], 10);

    if (isNaN(baseNumber)) return matches;

    // Always start with baseName0
    matches.push(baseName + "0");

    // Reverse lookup: Find all plannerIds that start with baseName
    let validPlannerIds = Object.values(skinsData.plannerIdMap).filter(id => id.startsWith(baseName));

    // Check decrementing (excluding 0 because it's already added)
    for (let i = baseNumber; i >= 1; i--) {
        let checkId = baseName + i;
        if (!validPlannerIds.includes(checkId)) break;
        matches.push(checkId);
    }

    // Check incrementing
    for (let i = baseNumber + 1; validPlannerIds.includes(baseName + i); i++) {
        matches.push(baseName + i);
    }

    // Sort numerically based on the trailing number
    return matches.sort((a, b) => parseInt(a.match(/\d+$/)[0]) - parseInt(b.match(/\d+$/)[0]));
}


function visible(element) {
    element.classList.add('show-block');
    element.classList.remove('hide');

    setTimeout(() => {
        element.classList.remove('show-block'); // Remove after 0.5s
    }, 500);
}


function invis(element) {
    element.classList.add('hide');
    element.classList.remove('show-block');
}

function hexToRgba(hex, alpha = 0.1) {
    hex = hex.replace(/^#/, ''); // Remove '#' if present
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join(''); // Convert shorthand hex (e.g., #123 → #112233)
    }
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function hexToHSL(hex) {
    if (hex == '') return
    // Remove '#' if present
    hex = hex.replace(/^#/, '');

    // Convert hex to RGB
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Normalize RGB values to range 0-1
    r /= 255, g /= 255, b /= 255;

    // Find min and max values
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // Achromatic (gray)
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    }

    return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}



