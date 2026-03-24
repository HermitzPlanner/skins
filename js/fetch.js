import { getPlannerId, getEventCode, getCharObject, setLightness, getYearFromTimestamp } from "./utils.js";
import { CN_SKINS_ENGLISH, SKIN_ICON_REPOSITORY, SKIN_PORTRAIT_REPOSITORY, NO_EFFECT_SKINS } from "./constants.js";
import { findSkinByName, getColorList, findSkinByAvatar } from "./utils.js";

function parseSkinsData(cnData, enData) {
    const charSkins = Object.entries(cnData.charSkins);
    charSkins.sort((a, b) => a[1].displaySkin.getTime - b[1].displaySkin.getTime);

    const plannerIdMap = {}
    const plannerIdMapGlobal = {}
    const costMap = {}
    const brands = new Set()
    const brandsCN = {}
    const artistsUnordered = new Set()

    const obtainApproaches = new Set()
    const missingChibis = []

    charSkins.forEach(element => {
        const skin = element[1];

        const obtainApproach = skin.displaySkin.obtainApproach
        const avatarId = skin.avatarId

        let modelName = skin.displaySkin.modelName
        if (modelName) {
            skin.displaySkin.modelName = skin.displaySkin.modelName.replace(". ", ".")
            // <-- Mr.Nothing when he meets mr. nothing

        }
        const skinName = skin.displaySkin.skinName
        if (skinName == '触及星辰' || skinName == '于万千宇宙之中') modelName = 'Amiya Guard'
        if (skinName == '寰宇独奏') modelName = 'Amiya Medic'

        const skinGroupId = skin.displaySkin.skinGroupId
        if (skinGroupId) {
            let skinGroupIdSplitted = skinGroupId.split('#')[1]
            //if (skinGroupIdSplitted == "as") skinGroupIdSplitted = "ambienceSynesthesia" 
            const brand = cnData.brandList[skinGroupIdSplitted]?.brandCapitalName || 'CROSSOVER'
            const brandName = cnData.brandList[skinGroupIdSplitted]?.brandName || 'CROSSOVER'

            brandsCN[brandName.replace("系列", "").replace(" ", "").replace("™", "")] = brand;

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
            if (skin.displaySkin.skinName == '惬意') price = 18
            const plannerId = getPlannerId(modelName)
            plannerIdMap[skin.displaySkin.skinName] = plannerId;
            if (NO_EFFECT_SKINS.includes(plannerId)) price = 15
            costMap[skin.displaySkin.skinName] = price // ??
            skin.price = price
        }
    });

    console.log("Unique obtainApproaches:", Array.from(obtainApproaches));

    const artists = new Set(
        [...artistsUnordered].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
    );

    return { cnData, enData, plannerIdMap, costMap, brands, brandsCN, artists }
}

function parseEventsData(data, skinsData, charData) {

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

    console.log("groups", groups)

    const events = []

    groups.forEach((group, index) => {
        const event = {}
        event.nameEnglish = group[0]
        event.nameMandarin = group[1]
        event.code = getEventCode(group[0])
        event.date = translateDateRange(group[3].replace(/关卡开放时间：|活动时间：/g, ''))
        event.skins = parseEventSkins(group, skinsData, charData)
        event.rewards = parseEventRewards(group)
        event.rateUps = {
            "sixStars": parseRateups(group, "★★★★★★："),
            "fiveStars": parseRateups(group, "★★★★★："),
            "fourStars": parseRateups(group, "★★★★："),
        }

        events.push(event)
    });

    console.log("events", events)
    return events
}

function parseRateups(group, stars) {
    let rateUps
    group.forEach((item, index) => {
        if (item.startsWith(stars)) {
            //console.log("amogus")
            //console.log(extraerNombres(item))
            rateUps = extraerNombres(item)
        }
    })

    return rateUps
}

function extraerNombres(str) {
    // Quitamos todo lo que está antes de ： y todo lo que está después de （
    const parteMedia = str.split('：')[1]?.split('（')[0]?.trim() || '';

    // Separamos por / y limpiamos espacios
    const nombres = parteMedia
        .split('/')
        .map(nombre => nombre.trim())
        .filter(Boolean);  // por si hay algún espacio raro

    return nombres;
}

function translateDateRange(chineseText, year = new Date().getFullYear()) {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return chineseText.replace(/(\d{2})月(\d{2})日 (\d{2}:\d{2})/g, (_, month, day, time) => {
        return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year} at ${time}`;
    }).replace(/-/g, ' to ');
}

function parseEventRewards(group) {
    const rewardStr = group.find(item => item.startsWith('[')) || '[]';
    return JSON.parse(rewardStr);
}

function parseEventSkins(group, skinsData, charData) {
    let eventSkins = [];
    group.forEach((item, index) => {
        if (item.startsWith("brand-single") ||
            item.startsWith("brand-multiple") ||
            item.startsWith("brand-rerun-single") ||
            item.startsWith("brand-rerun-multiple")) {

            const brandNameCN = group[index + 1].match(/【(.*?)】/)[1]
            const brandNameCapital = skinsData.brandsCN[brandNameCN]
            //console.log("brandNameCN", brandNameCN)
            //console.log("brandNameCapital", brandNameCapital)

            eventSkins.push({
                name: brandNameCapital,
                isBrand: true,
                isRerun: item.includes("rerun") ? true : false,
                isMultiple: item.includes("multiple") ? true : false
                // operator: match[2],  
                // isRerun: false,
                // getFromPack: false
            });
        }

        if (item.startsWith("◆")) {
            const suffix = item.slice(1, item.indexOf("【") !== -1 ? item.indexOf("【") : undefined);

            const isRerun = suffix.includes("r");
            const getFromPack = suffix.includes("p");

            const match = item.match(/◆[rp]*【.*】系列 - (.*?) - (.*)/);


            if (match) {
                const skinName = match[1]
                const plannerId = skinsData.plannerIdMap[skinName]
                const skinObject = findSkinByName(skinsData.cnData, skinName)
                const avatarId = skinObject.avatarId
                const skinObjectGlobal = findSkinByAvatar(skinsData.enData, avatarId)
                const skinNameGlobal = skinObjectGlobal?.displaySkin?.skinName || skinName
                //console.log("charData", charData)
                const charObject = getCharObject(skinObject.displaySkin.modelName.toLowerCase(), charData)
                const colors = getColorList(skinObject.displaySkin.colorList)
                const gradientAngle = '90deg'
                const darkColors = colors.map(color => setLightness(color, 0.10, 0.80));
                const profession = charObject.profession.toLowerCase()
                const getTime = skinObject.displaySkin.getTime
                const year = getYearFromTimestamp(getTime)
                //console.log("charObject", charObject)

                eventSkins.push({
                    name: skinName,
                    nameEnglish: skinNameGlobal,
                    modelName: match[2],
                    modelNameEnglish: skinObject.displaySkin.modelName,
                    operator: match[2],
                    isRerun,
                    getFromPack,
                    darkColors: darkColors,
                    linearGradientDarkSliceTwo: `linear-gradient(${gradientAngle}, ${darkColors.slice(-2).join(', ')})`,

                    plannerId: plannerId,
                    portraitRepository: SKIN_PORTRAIT_REPOSITORY(plannerId),
                    iconRepository: SKIN_ICON_REPOSITORY(plannerId),
                    price: getFromPack ? "$30" : skinObject.price, // > 0 ? skinsData.costMap[skinName] : 'Free',
                    colors: colors,
                    profession: profession,
                    professionImage: "static/friend_assist_profession_hub/icon_profession_" + profession + ".png",
                    gradientAngle: gradientAngle,
                    borderGradient: `linear-gradient(${gradientAngle}, ${colors.join(', ')}) 1`,
                    linearGradientArray: `linear-gradient(${gradientAngle}, ${colors.join(', ')})`,
                    linearGradientArraySliceTwo: `linear-gradient(${gradientAngle}, ${colors.slice(0, 2).join(', ')})`,
                    width: 180,
                    height: 360,
                    year: year,
                });
            }
        }

    });

    return eventSkins
}

// ====================================================
// Fetch repos, thank you Kengxxiao
// ====================================================

export const fetchGameData = async () => {
    try {
        const [cnData, enData, charData, rawEventsData] = await Promise.all([
            fetch('https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/refs/heads/master/zh_CN/gamedata/excel/skin_table.json')
                .then(response => response.json()),
            fetch('https://raw.githubusercontent.com/ArknightsAssets/ArknightsGamedata/refs/heads/master/en/gamedata/excel/skin_table.json')
                .then(response => response.json()),
            fetch('https://raw.githubusercontent.com/Kengxxiao/ArknightsGameData/refs/heads/master/zh_CN/gamedata/excel/character_table.json')
                .then(response => response.json()),
            fetch('static/data.txt')
                .then(response => response.text()),
        ]);

        const skinsData = parseSkinsData(cnData, enData);
        const eventsData = parseEventsData(rawEventsData, skinsData, charData);
        return { skinsData, eventsData, charData }; // Return the object
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Rethrow to handle errors in the importing code
    }
};