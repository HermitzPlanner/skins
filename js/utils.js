import { ALTERS_MAP, FASHION_REVIEWS } from "./constants.js";
import { EVENTS_DATA } from "./main.js";
import { missingAssets } from "./main.js";

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

export function checkedButtonStyle(cbox, enableGlow = true, enableText = false) {
    cbox.style.border = "1px solid var(--accent)";
    cbox.style.background = "var(--accent-bg)";
    cbox.style.background = `linear-gradient(to bottom, var(--gradient-top), var(--gradient-bottom))`;
    if (enableText) cbox.style.color = "var(--accent)";
    if (enableGlow) cbox.style.boxShadow = "0px 0px 10px 2px var(--accent-bg)";
}

export function uncheckedCboxStyle(cbox) {
    cbox.parentElement.style.border = "";
    cbox.parentElement.style.background = "";
    cbox.parentElement.style.boxShadow = "";
    cbox.parentElement.style.color = "";
}

export function uncheckedButtonStyle(cbox) {
    cbox.style.border = "";
    cbox.style.background = "";
    cbox.style.boxShadow = "";
    cbox.style.color = "";
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

        if (eventCode == skinEvent && !element.hasAttribute("data-is-fashion")) {
            if (element)
                if (!element.classList.contains('show')) {
                    element.classList.add('show');
                    element.classList.remove('hide');
                }
        }
    });
}

export function revealFashion(eventCode) {
    const fashionYear = document.getElementById("fashion-year").textContent

    document.querySelectorAll('[data-event]').forEach(element => {
        const skinEvent = element.getAttribute('data-event')
        const skinYear = element.getAttribute("data-year")



        if (eventCode == skinEvent && element.getAttribute("data-year") == fashionYear) {
            console.log("fashionYear", fashionYear)
            console.log("skinEvent", skinEvent)
            console.log("skinYear", skinYear)
            if (element)
                if (!element.classList.contains('show')) {
                    element.classList.add('show');
                    element.classList.remove('hide');
                }
        }
    });

}

export function getCharObject(char, charData) {

    for (const key in charData) {
        if (charData[key].appellation.toLowerCase() === char) {
            //extraProperties(charData[key])
            return charData[key]; // Return the matching object
        }
    }
    console.error(char)
    return null; // Return null if no match is found
}

export function getCharObjectWithName(char, charData) {

    for (const key in charData) {
        if (charData[key].name === char) {
            //extraProperties(charData[key])
            return charData[key]; // Return the matching object
        }
    }
    console.error(char)
    return null; // Return null if no match is found
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
       if (sectionId == 'show-skins' && section.id == 'planner') {
        document.getElementById('container-of-events').style.display = 'none'
        document.getElementById('container-of-skins').style.display = 'flex'
        return
       }  
       if (sectionId == 'show-events' && section.id == 'planner') {
        document.getElementById('container-of-events').style.display = 'flex'
        document.getElementById('container-of-skins').style.display = 'none'
        return
       } 
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
    ctx.drawImage(bg, 19, 389, 276, 608, 0, 0, 180, 360)
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
    //bottomCtx.drawImage(bg, 538, 82, 200, 58, 0, 0, 180, 28)
    bottomCtx.drawImage(bg, 538, 111, 200, 28, 0, 0, 180, 28)
    
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

export function drawSkinTopBackground(bottomCanvas, eventSkin) {
    const bottomCtx = bottomCanvas.getContext("2d")
    
    //bottomCtx.drawImage(bg, 538, 82, 200, 58, 0, 0, 180, 28)
    bottomCtx.drawImage(bg, 770, 219, 200, 28, 0, 0, 180, 28) // 194 224
    //bottomCtx.filter = "none"
    
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

export function setLightness(hex, targetL = 0.10, opacity = 1.0) {
    // Limpiar el hex y manejar shorthand (#rgb → #rrggbb)
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // HEX → RGB (0-1)
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // RGB → HSL
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // gris / achromático
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

    // Aplicamos el nuevo lightness
    l = Math.max(0, Math.min(1, targetL)); // clamp 0..1 por seguridad

    // HSL → RGB
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const hue2rgb = (t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    const newR = Math.round(hue2rgb(h + 1 / 3) * 255);
    const newG = Math.round(hue2rgb(h) * 255);
    const newB = Math.round(hue2rgb(h - 1 / 3) * 255);

    // Devolvemos según opacity
    if (opacity >= 1) {
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    } else {
        // clamp opacity entre 0 y 1
        const safeOpacity = Math.max(0, Math.min(1, opacity));
        return `rgba(${newR}, ${newG}, ${newB}, ${safeOpacity})`;
    }
}

export function trimCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = pixels.data;
    const bound = { top: null, left: null, right: null, bottom: null };

    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 0) { // alpha > 0 → píxel visible
            const x = (i / 4) % canvas.width;
            const y = Math.floor(i / 4 / canvas.width);

            if (bound.top === null || y < bound.top) bound.top = y;
            if (bound.bottom === null || y > bound.bottom) bound.bottom = y;
            if (bound.left === null || x < bound.left) bound.left = x;
            if (bound.right === null || x > bound.right) bound.right = x;
        }
    }

    if (bound.top === null) return null; // imagen completamente transparente

    const width = bound.right - bound.left + 1;
    const height = bound.bottom - bound.top + 1;

    const trimmed = document.createElement('canvas');
    trimmed.width = width;
    trimmed.height = height;
    const trimmedCtx = trimmed.getContext('2d');

    trimmedCtx.drawImage(
        canvas,
        bound.left, bound.top, width, height,   // source
        0, 0, width, height                     // destination
    );

    return trimmed.toDataURL('image/png');
}

export function missingElementCheck(missingElement, link) {
    const img = new Image(); // Create an image object
    img.src = link;

    img.onerror = () => {
        missingAssets.push(missingElement);
    };
}

export function getTopColors(imgElement, cantidad = 4) {
    console.log("imgElement.width", imgElement)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    ctx.drawImage(imgElement, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const map = new Map();

    // Muestreamos cada 5–10 píxeles para ir más rápido
    for (let i = 0; i < data.length; i += 20) {  // ← podés bajar a 12 o 8 si querés más precisión
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // ignoramos transparencia casi total
        if (data[i + 3] < 30) continue;

        const key = `${r},${g},${b}`;
        map.set(key, (map.get(key) || 0) + 1);
    }

    // ordenamos por cantidad descendente
    const sorted = [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, cantidad);

    return sorted.map(([rgb]) => {
        const [r, g, b] = rgb.split(',').map(Number);
        return { rgb: [r, g, b], hex: `#${r.toString(16).padStart(2, 0)}${g.toString(16).padStart(2, 0)}${b.toString(16).padStart(2, 0)}` };
    });
}

export function getNameWithPlannerId(clave, data) {
    const encontrado = Object.entries(data.skinsData.plannerIdMap).find(
        ([nombre, codigo]) => codigo === clave
    );

    return encontrado ? encontrado[0] : null;  // o "" o undefined, según prefieras
}


export function getMatchingPlannerIds(plannerId, skinsData) {
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

export function getKeyByValue(obj, value) {
    return Object.keys(obj).find(key => obj[key] === value) || null;
}

export function getYearFromTimestamp(timestamp) {
    return new Date(timestamp * 1000).getFullYear();
}