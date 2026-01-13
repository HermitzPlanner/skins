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
const eventrepo = (eventid) => {
  // Chequea si empieza con "is" + al menos un dígito
  const esPng = /^is\d/.test(eventid);
  
  const extension = esPng ? '.png' : '.jpg';
  
  return `https://raw.githubusercontent.com/${gituser}/${repo}/main/events/resized/resized_${eventid}${extension}`;
};
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
    "Wiš'adel": "Wisadel",
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

const NoEffectSkins = [
    "texas1", "specter1", "courier1", "exusiai1", "cliffheart1", "cuora1", "ifrit1", "sora1", "gummy1", "jessica1", "jessica2",
    "pramanix1", "feater1", "liskarm1", "gavial1", "greythroat1", "midnight1", "beehunter1", "astesia1", "rope2", "provence1",
    "platinum1", "croissant2", "april1", "glaucus1", "texas2", "dobermann1", "firewatch2", "gravel1", "hung1", "tachanka1",
    "shirayuki1", "ayerscarpe1", "flint1", "courier2", "vigna2", "zima2", "folinic1", "perfumer2", "sideroca1", "jaye1",
    "astesia2", "snowsant1", "andreana1", "kafka1", "feater2", "tuye1", "scavenger1", "aurora1", "reed1", "kirara1",
    "blacknight1", "lapluma1", "kazemaru1", "greyyalter1", "mousse1"
  ];

