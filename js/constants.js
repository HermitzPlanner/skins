const gituser = "HermitzPlanner"
const repo = "planner-images"
const defaultRepo = 'operator-'
const imgrepo = (size, plannerId) => {
    if (!plannerId.includes('0')) {
       return `https://raw.githubusercontent.com/${gituser}/${repo}/main/${size}/${plannerId}.png`
    } else {
        return `https://raw.githubusercontent.com/${gituser}/${defaultRepo}${size}/main/${size == 'icon' ? 'e0' : 'e2'}/${operatorMap[plannerId]}.png`
    }
} 
const defaultimgrepo = (size, plannerId) => `https://raw.githubusercontent.com/${gituser}/${defaultRepo}${size}/main/e0/${plannerId}.png`
const eventrepo = (eventid) => `https://raw.githubusercontent.com/${gituser}/${repo}/main/events/resized/resized_${eventid}.jpg`
const inspectImg = 'https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/search.svg'
const originiteLink = 'https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/puregem.png'
const cartLink = 'https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/cart.svg'

const art = "立绘"
const icon = "头像"
const portrait = "半身像"

const altersMap = {
    "Lava the Purgatory": "Lava Alter",
    "Nearl the Radiant Knight": "Nearl Alter",
    "Greyy the Lightningbearer": "Greyy Alter",
    "Kroos the Keen Glint": "Kroos Alter",
    "Specter the Unchained": "Specter Alter",
    "Ch'en the Holungday": "Ch'en Alter",
    "Skadi the Corrupting Heart": "Skadi Alter",
    "Gavial the Invincible": "Gavial Alter",
    "Texas the Omertosa": "Texas Alter",
    "Reed The Flame Shadow": "Reed Alter",
    "Swire the Elegant Wit": "Swire Alter",
    "Silence the Paradigmatic": "Silence Alter",
    "Eyjafjalla the Hvít Aska": "Eyja Alter",
    "Jessica the Liberated": "Jessica Alter",
    "Hibiscus the Purifier": "Hibiscus Alter",
    "Executor the Ex Foedere": "Executor Alter",
    /* cirilic */
    "Гум": "Gummy",
    "Зима": "Zima",
    "Истина": "Istina",
    "Позёмка": "Pozyomka",
    "Роса": "Poca",
    /* latin */
    "Młynar": "Mlynar",
}

const obtainApproachesMap = {
    "任务奖励": "Mission Reward",
    "活动获得": "Event Acquisition",
    "采购中心": "Shop Purchase",
    "设定集兑换码兑换": "Redeemed via Setting Collection Code",
    "集成战略": "Integrated Strategies (IS Mode)",
    "特典获得": "Special Edition Acquisition",
    "活动赠送": "Event Gift",
    "生息演算": "Reclamation Algorithm (RA Mode)",
    "线下礼包获得": "Offline Gift Pack Acquisition",
    "采购中心、兑换码获得": "Purchase Center, Redeemed via Code"
};


const cnSkinsInEnglish = {
    '繁霜满阶': '' // Matoi
}
    

