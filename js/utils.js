import { ALTERS_MAP, FASHION_REVIEWS } from "./constants.js";
import { EVENTS_DATA } from "./main.js";

const contentMap = {}
const normalize = (string) => string.replace(/[-.0123456789'" ()#]/g, "").toLowerCase()
export const getEventCode = (string) => string.replace(/[-.'" ()#!]/g, "").toLowerCase()

export const getPlannerId = (string) => {

    let plannerId = normalize((ALTERS_MAP[string] || string))

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

export function checkedCboxStyle(cbox, enableGlow = true, enableText = false) {
    cbox.parentElement.style.border = "1px solid var(--accent)";
    cbox.parentElement.style.background = "var(--accent-bg)";
    cbox.parentElement.style.background = `linear-gradient(to bottom, var(--gradient-top), var(--gradient-bottom))`;
    if (enableText) cbox.parentElement.style.color = "var(--accent)";
    if (enableGlow) cbox.parentElement.style.boxShadow = "0px 0px 10px 2px var(--accent-bg)";
}

export function uncheckedCboxStyle(cbox) {
    cbox.parentElement.style.border = "";
    cbox.parentElement.style.background = "";
    cbox.parentElement.style.boxShadow = "";
    cbox.parentElement.style.color = "";
}

export function resetAll(selector) {
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

export function revealIfElementMatchesEvent(eventCode) {
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

export function findSkinByName(skinsData, skinName) {
    for (const key in skinsData.charSkins) {
        if (skinsData.charSkins[key].displaySkin.skinName === skinName) {
            return skinsData.charSkins[key]; // Return the matching object
        }
    }
    return null; // Return null if no match is found
}

export function findSkinByAvatar(skinsData, avatar) {
    for (const key in skinsData.charSkins) {
        if (skinsData.charSkins[key].avatarId === avatar) {
            return skinsData.charSkins[key]; // Return the matching object
        }
    }
    return null; // Return null if no match is found
}

export function getColorList(array) {
    // Filtramos vacíos y falsy
    let colorList = array.filter(color => color && typeof color === 'string' && color.trim() !== '');

    function normalizeHexColor(raw) {
        let color = raw.trim().toLowerCase();

        // Sacamos el # si lo tiene
        if (color.startsWith('#')) {
            color = color.slice(1);
        }

        // Casos válidos
        if (color.length === 3) {
            // #abc → #aabbcc
            return '#' + color.split('').map(c => c + c).join('');
        }

        if (color.length === 6) {
            // #rrggbb
            return '#' + color;
        }

        if (color.length === 7) {
            // rrggbb + 1 dígito alpha → lo completamos con 0 (o con el mismo si querés)
            // Ej: 34214c0 → 34214c00
            return '#' + color + '0';
        }

        if (color.length === 8) {
            // #rrggbbaa completo, lo dejamos joya
            return '#' + color;
        }

        // Si no matchea nada → logueamos y devolvemos negro o transparente
        console.warn(`Color hex inválido o raro: "${raw}" → lo ponemos negro`);
        return '#000000';
        // O si preferís tirar error: throw new Error(`Color inválido: ${raw}`);
    }

    return colorList.map(normalizeHexColor);
}

export function getEventListByName(skinName, isFashion = false) {
    // console.log("EVENTS_DATA", EVENTS_DATA);   // descomentalo si querés ver el quilombo

    if (isFashion) {
    const matchedEvents = EVENTS_DATA
        .map(event => event.nameEnglish)
        .filter(name => name && typeof name === 'string' && name.trim().startsWith("Fashion Review"));

    return matchedEvents.length > 0 
        ? matchedEvents 
        : ["No upcoming event"];
}

    const matchedEvents = EVENTS_DATA
        .filter(event => {
            // Nos aseguramos que .skins exista y sea array
            if (!Array.isArray(event.skins)) return false;

            // Buscamos en cada skin si el .name incluye (o es igual) al skinName
            return event.skins.some(skinObj => {
                if (!skinObj || typeof skinObj.name !== 'string') return false;

                // Opción 1: contains (más flexible, recomendado)
                return skinObj.name.toLowerCase().includes(skinName.toLowerCase());

                // Opción 2: match exacto (si querés ser estricto, descomentá esta y comentá la de arriba)
                // return skinObj.name === skinName;
            });
        })
        .map(event => event.nameEnglish);

    // Si no encuentra nada, devolvemos el mensajito default
    return matchedEvents.length > 0 ? matchedEvents : ["No upcoming event"];
}

export function getReleaseTime(getTime) {
    if (!getTime) return 'Not released'
    let timestampCN = getTime;
    let dateCN = new Date(timestampCN * 1000);
    let yearCN = dateCN.getFullYear();
    let monthCN = String(dateCN.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    let dayCN = String(dateCN.getDate()).padStart(2, '0');
    return yearCN + '-' + monthCN + '-' + dayCN;
}

export function hexToRgba(hex, alpha = 0.1) {
    hex = hex.replace(/^#/, ''); // Remove '#' if present
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join(''); // Convert shorthand hex (e.g., #123 → #112233)
    }
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function checkedSkin(element) {
    //element.querySelector(".overlay").style.display = "flex"
    element.querySelector(".overlay").style.opacity = "1"
}

export function uncheckedSkin(element) {
    //element.querySelector(".overlay").style.display = "none"
    element.querySelector(".overlay").style.opacity = "0"
}

export const resetDiv = id => document.getElementById(id).innerHTML = ""

export function visible(element) {
    element.classList.add('show-block');
    element.classList.remove('hide');

    setTimeout(() => {
        element.classList.remove('show-block'); // Remove after 0.5s
    }, 500);
}


export function invis(element) {
    element.classList.add('hide');
    element.classList.remove('show-block');
}

export function getEditionFromTimestamp(getTime) {
    let edition = 0

    if (getTime > FASHION_REVIEWS[FASHION_REVIEWS.length - 1].timestamp) return edition

    FASHION_REVIEWS.slice().reverse().forEach((review, index) => {
        if (getTime <= review.timestamp) edition = review.edition
    });

    return edition
}

export function showSection(sectionId) {
    document.documentElement.style.setProperty('--scrollbar-track', `var(--body-bg)`)
    document.documentElement.style.setProperty('--scrollbar-thumb', `var(--equip-bg-2)`)
    // Hide all sections
    document.querySelectorAll("section").forEach(section => {
        section.style.display = "none";
    });

    // Show the selected section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = "flex";
    }
}

const bg = new Image()
bg.src = "static/img/classic_gacha.png"
const rerunImg = new Image()
rerunImg.src = "static/img/replicate_warning.png"

export function drawSkinBackground(canvas, eventSkin) {
    const ctx = canvas.getContext("2d")
    ctx.filter = 'grayscale(100%)';
    ctx.drawImage(bg, 19, 389, 276, 608, 0, 0, eventSkin.width, eventSkin.height)
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'color';

    if (eventSkin.colors.length === 1) {
        ctx.fillStyle = eventSkin.colors[0]; // Color sólido si hay un solo color
    } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, 600); // Gradiente vertical
        eventSkin.colors.forEach((color, index) => {
            gradient.addColorStop(index / (eventSkin.colors.length - 1), color);
        });
        ctx.fillStyle = gradient;
    }
    ctx.fillRect(0, 0, 276, 608);
    ctx.globalCompositeOperation = 'source-over'
}

export function drawSkinBottomBackground(bottomCanvas, eventSkin) {
    const bottomCtx = bottomCanvas.getContext("2d")
    bottomCtx.drawImage(bg, 538, 82, 200, 58, 0, 0, 180, 28)
    bottomCtx.globalCompositeOperation = 'color';
    if (eventSkin.colors.length === 1) {
        bottomCtx.fillStyle = eventSkin.colors[0]; // Color sólido si hay un solo color
    } else {
        const gradient = bottomCtx.createLinearGradient(0, 0, 180, 0); // Gradiente horizontal
        eventSkin.colors.forEach((color, index) => {
            gradient.addColorStop(index / (eventSkin.colors.length - 1), color);
        });
        bottomCtx.fillStyle = gradient;
    }
    bottomCtx.fillRect(0, 0, 180, 28); // Ajustado al tamaño del canvas
    bottomCtx.globalCompositeOperation = 'source-over';
}