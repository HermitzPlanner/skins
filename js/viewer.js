const animationSelect = document.getElementById("animation")
const perspectiveSelect = document.getElementById("perspective")
const speedSelect = document.getElementById("speed")
const quitBtn = document.getElementById("quit-btn")
const puregemLink = 'https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/puregem.png'
let app
let perspective
let chibiWidth
let chibiHeight
let globalPlannerId
let globalSkinId
let skinsData

let originalIconUrl = ""
let originalArtUrl = ""
let originalSkinName = ""
let originalPlannerId = ""
let originalSkinId = ""

async function viewer(plannerId) {
  const viewerFullImage = document.querySelector(".full-image img")
  viewerFullImage.src = ""

  const viewerIconClone = document.querySelector(".viewer-icon img")
  viewerIconClone.src = ""

  const viewer = document.querySelector(".viewer")
  viewer.style.display = "block"

  chibiWidth = document.getElementById("chibi-container").offsetWidth;
  chibiHeight = document.getElementById("chibi-container").offsetHeight;

  const plannerSkinsCall = await fetch('https://raw.githubusercontent.com/HermitzPlanner/hermitzplanner.github.io/main/json/table_data.json')
  const plannerSkinsData = await plannerSkinsCall.json()
  skinsData = plannerSkinsData

  plannerSkinsData.forEach(plannerSkin => {
    if (plannerId !== plannerSkin.plannerId) { return }
    if (plannerSkinsData.appearances !== "") {
      document.querySelector(".viewer-appearances").style.display = "flex"
      document.querySelector(".viewer-appearances-information").innerHTML = ""

      let appearancesArray = plannerSkin.appearances.split(', ');
      appearancesArray.forEach(appear => {
        document.querySelector(".viewer-appearances-information").innerHTML += `<div> - ${appear} </div>`
      });

    }
    if (plannerSkin.dynamicCompile !== "") {
      document.querySelector(".viewer-dynamic").style.display = "flex"
      document.querySelector(".viewer-dynamic-information").innerHTML = `<a href=${plannerSkin.dynamicCompile} target="_blank">Link (official hg site)</a>`
    } else {
      document.querySelector(".viewer-dynamic").style.display = "none"
    }
    // Selecting elements
    const viewerCharNameClone = document.querySelector(".viewer-char-name");
    const viewerSkinNameClone = document.querySelector(".viewer-skin-name");
    const viewerIconClone = document.querySelector(".viewer-icon img")
    const viewerBrandInformationClone = document.querySelector(".viewer-brand-information");
    const viewerArtistInformationClone = document.querySelector(".viewer-artist-information");
    const viewerPriceInformationClone = document.querySelector(".viewer-price-information");
    const viewerReleaseCNClone = document.querySelector(".viewer-release-cn");
    const viewerReleaseGlobalClone = document.querySelector(".viewer-release-global");
    const viewerObtainInformationClone = document.querySelector(".viewer-obtain-information");
    const viewerDialogClone = document.querySelector(".viewer-dialog");

    plannerSkin.skinNameEN = plannerSkin.skinNameEN || plannerSkin.skinNameCN;

    // Setting textContent to empty string
    viewerCharNameClone.textContent = plannerSkin.modelNameEN;
    viewerSkinNameClone.textContent = originalSkinName = plannerSkin.skinNameEN;
    viewerIconClone.src = originalIconUrl = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/icon/" + plannerSkin.plannerId + ".png"
    viewerFullImage.src = originalArtUrl = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/art/" + plannerSkin.plannerId + ".png"
    viewerBrandInformationClone.textContent = plannerSkin.brand;
    viewerArtistInformationClone.textContent = plannerSkin.drawerList;

    if (plannerSkin.skinPrice >= 15 && plannerSkin.skinPrice <= 24) {
      viewerPriceInformationClone.innerHTML = '<img class="viewer-puregem" src="' + puregemLink + '">' + plannerSkin.skinPrice;
    } else {
      viewerPriceInformationClone.textContent = "Free"
    }

    viewerReleaseCNClone.textContent = plannerSkin.getTimeCN
    viewerReleaseGlobalClone.textContent = plannerSkin.getTimeEN
    viewerObtainInformationClone.textContent = plannerSkin.obtainApproachEN
    viewerDialogClone.textContent = `"` + plannerSkin.dialog + `"`

    perspective = "front"

    originalPlannerId = plannerSkin.plannerId
    originalSkinId = plannerSkin.skinId
    chibiUpdate(plannerSkin.plannerId, plannerSkin.skinId.toLowerCase())

    // Image handling
    viewerFullImage.style.transform = 'scale(1)';
    viewerFullImage.style.top = '0'
    viewerFullImage.style.left = '130px'
    viewerFullImage.style.transition = 'transform 0.3s ease-out'; // add transition

    // Zoom in-out
    let scale = 1;
    const minScale = 0.5;
    const maxScale = 5;
    viewerFullImage.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY || e.detail || e.wheelDelta;
      scale = Math.max(minScale, Math.min(maxScale, scale - 0.1 * Math.sign(delta)));
      viewerFullImage.style.transform = `scale(${scale})`;
    });

    // Define variables to store the starting mouse position and image position
    let startX = 0;
    let startY = 0;
    let imageX = 0;
    let imageY = 0;

    // Attach an event listener to the image to track mouse movements
    viewerFullImage.addEventListener('mousedown', e => {
      startX = e.clientX;
      startY = e.clientY;
      imageX = viewerFullImage.offsetLeft;
      imageY = viewerFullImage.offsetTop;
      document.addEventListener('mousemove', moveImage);
    });

    // Function to move the image
    function moveImage(e) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      viewerFullImage.style.left = `${imageX + deltaX}px`;
      viewerFullImage.style.top = `${imageY + deltaY}px`;
    }

    // Detach the event listener when the mouse button is released
    document.addEventListener('mouseup', e => {
      document.removeEventListener('mousemove', moveImage);
    });

  });
}

function chibiUpdate(plannerId, skinId, original) {
  let repo = "chibi-assets"
  if (original != null) {
    repo = "operator-chibi-assets"
  } else {
    repo = "chibi-assets"
  }
  //console.log ("entered function")
  //console.log ("planner id", plannerId)
  //console.log("skin id", skinId)

  // Reset
  globalPlannerId = plannerId
  globalSkinId = skinId

  // Remove previous canvas
  document.querySelector("canvas")?.remove();
  app?.destroy();

  // New pixi app and canvas
  app = new PIXI.Application({
    width: 800,
    height: 600,
    backgroundAlpha: 0,
    premultiplyAlpha: true,
    antialias: true,
  });
  app.renderer.resize(chibiHeight, app.renderer.height);
  app.renderer.resize(chibiWidth, app.renderer.width);
  const canvas = app.view;
  canvas.id = 'chibi-canvas';
  document.getElementById('chibi-container').appendChild(canvas);

  loadCircle();
  // ${original}
  // Loading and handling the spine assets
  PIXI.Assets.load(`https://raw.githubusercontent.com/HermitzPlanner/${repo}/main/${plannerId}/${perspective}/${skinId}.skel`).then((skinAsset) => {
    // Reset
    app.stage.removeChildren() // Removes circle
    chibiScale = 0.5
    timeScale = 1
    // Constants
    const skinSpine = new PIXI.spine.Spine(skinAsset.spineData);
    const animationList = skinSpine.spineData.animations
    const animation = (perspective === "build") ? "Relax" : "Idle";

    // Mulberry check
    if (plannerId == "mulberry2") {
      //spineData > Bones
      // Front 207 211
      // Back 34 39
      // Build 207 211
      if (perspective == "front" || perspective == "build") {
        skinSpine.spineData.bones[207].transformMode = 0
        skinSpine.spineData.bones[211].transformMode = 0
      } if (perspective == "back") {
        skinSpine.spineData.bones[34].transformMode = 0
        skinSpine.spineData.bones[39].transformMode = 0
      }

    }

    // Functions
    updateAnimationList(animationList)

    // Spine settings
    skinSpine.x = app.screen.width / 2;
    skinSpine.y = app.screen.height;
    skinSpine.scale.set(0.5)
    skinSpine.state.setAnimation(0, animation, true);
    skinSpine.interactive = true;
    skinSpine.buttonMode = true;
    skinSpine.alpha = 1;

    // Spine dynamic settings
    app.ticker.add(() => {
      skinSpine.state.timeScale = timeScale;
      skinSpine.scale.set(chibiScale);
    });


    // Chibi drag handler
    let startPosition = { x: 0, y: 0 };
    skinSpine.on('mousedown', onDragStart);
    skinSpine.on('mouseup', onDragEnd);
    skinSpine.on('mousemove', onDragMove);

    function onDragStart(event) {
      startPosition = event.data.global.clone();
      skinSpine.alpha = 0.7;
      skinSpine.dragging = true;
    }

    function onDragEnd() {
      skinSpine.alpha = 1;
      skinSpine.dragging = false;
    }

    function onDragMove(event) {
      if (skinSpine.dragging) {
        const newPosition = event.data.global.clone();

        // Calculate the distance moved by the mouse
        const dx = newPosition.x - startPosition.x;
        const dy = newPosition.y - startPosition.y;

        // Update the SkinSpine object's position based on the mouse movement
        skinSpine.x += dx;
        skinSpine.y += dy;

        // Update the start position for the next movement calculation
        startPosition = newPosition;
      }
    }

    // App send
    app.stage.addChild(skinSpine);
    app.renderer.render(app.stage);

    // Debug
    //console.log(app.stage.children[0])

  });

  function loadCircle() {
    const circle = new PIXI.Graphics();
    circle.lineStyle(5, 0xffffff);
    circle.moveTo(25, 0);
    circle.arc(0, 0, 25, 0, 1);
    circle.moveTo(25, 0);
    circle.arc(0, 0, 25, 0, -1);
    circle.x = app.renderer.width / 2;
    circle.y = app.renderer.height / 2;
    app.stage.addChild(circle);

    app.ticker.add(() => {
      circle.rotation += 0.1;
    });
  }

  compareSelect(plannerId)
}

animationSelect.addEventListener('change', function () {
  app.stage.children[0].state.setAnimation(0, animationSelect.value, true);
  if (animationSelect.value == "Sit") {
    app.stage.children[0].y = app.screen.height / 1.22
  }
  // mulberry is such an enigma...
  if (animationSelect.value == "Sit" && globalPlannerId == "mulberry2") {
    app.stage.children[0].spineData.bones[207].transformMode = 1
    app.stage.children[0].spineData.bones[211].transformMode = 1
  }
  if (animationSelect.value !== "Sit" && globalPlannerId == "mulberry2") {
    app.stage.children[0].spineData.bones[207].transformMode = 0
    app.stage.children[0].spineData.bones[211].transformMode = 0
  }
  if (animationSelect.value == "Sleep" && globalPlannerId == "mulberry2") {
    app.stage.children[0].spineData.bones[207].transformMode = 1
    app.stage.children[0].spineData.bones[211].transformMode = 1
  }
})

function updateAnimationList(animationList) {
  animationSelect.innerHTML = '<option selected disabled value="Animation">Animation</option>'
  animationList.forEach(animation => {
    animationSelect.innerHTML += `<option value="${animation.name}">${animation.name}</option>`;
  });
}

perspectiveSelect.addEventListener('change', function () {
  perspective = perspectiveSelect.value;
  chibiUpdate(globalPlannerId, globalSkinId);
  //speedSelect.value = 1
});



// Chibi scale handle
let chibiScale = 1;
document.getElementById("chibi-container").addEventListener('wheel', function (e) {
  e.preventDefault();
  let delta = e.deltaY || e.detail || e.wheelDelta;

  if (delta < 0) {
    chibiScale += 0.1;
  } else {
    if (chibiScale > 0.2) {
      chibiScale -= 0.1;
    }
  }
});

// Chibi speed handle
speedSelect.addEventListener("change", () => {
  timeScale = speedSelect.value
})
document.addEventListener('keydown', function (event) {
  // Check if the pressed key is the Escape key (key code 27)
  if (event.key === 'Escape' || event.keyCode === 27) {
    // Call the quitViewer function
    quitViewer();
  }
});
function quitViewer() {
  const viewer = document.querySelector(".viewer")
  viewer.style.display = "none"
  perspectiveSelect.value = 'front'
  location.hash = ""

  const checkboxExtraInfo = document.querySelector('.viewer-extra-info');
  if (checkboxExtraInfo && checkboxExtraInfo.checked) {
    // If the checkboxExtraInfo is checked (true), set it as unchecked (false)
    checkboxExtraInfo.checked = false;
    chibiExtraInfo()
  }

  const checkbox = document.querySelector('.viewer-checkbox-compare');
  if (checkbox && checkbox.checked) {
    checkbox.checked = false;
    compareOriginal()
  }
}

function chibiExtraInfo() {
  const cbox = document.querySelector(".viewer-extra-info")
  const divs = ["chibi-container", "chibi-menu"];
  const extraInfoBtn = document.getElementById("extra-info-btn");
  const viewerSkinDetails = document.querySelector(".viewer-skin-details");

  if (cbox.checked) {
    // If the checkbox is checked, show viewerSkinDetails and hide divs
    viewerSkinDetails.style.display = "flex";
    extraInfoBtn.textContent = "Hide info";
    divs.forEach((div) => {
      const element = document.querySelector(`.${div}`);
      if (element) {
        element.style.display = "none";
      }
    });
  } else {
    // If the checkbox is unchecked, hide viewerSkinDetails and show divs
    viewerSkinDetails.style.display = "none";
    extraInfoBtn.textContent = "Show info";
    divs.forEach((div) => {
      const element = document.querySelector(`.${div}`);
      if (element) {
        element.style.display = "flex";
      }
    });
  }
}

function compareSelect(plannerId) {
  return
  console.log("checking plannerID")
  console.log(plannerId)
  const skinObject = skinsData.find(obj => obj.plannerId === plannerId)
  const rarity = skinObject.rarity.replace("TIER_", "")
  const defaultOutfit = plannerId.slice(0, -1) + '0'
  console.log(skinObject)
  console.log(plannerId)
  console.log(rarity)
  if (rarity <= 3) {
    console.log("low rarity")
  }
  
  const compareItem = document.getElementById("compare");
  const currentSkin = `<option value="build" selected>- ${skinObject.skinNameEN} (Current Skin)</option>`;
  const defaultSkin = `<option value="build">- Default Skin </option>`;

  // Now, only add defaultSkinTwo if the rarity is greater than 3
  let htmlContent = currentSkin + defaultSkin;

  // plannerId always ends in a number greater than 0
  

  if (rarity > 3) {
    const defaultSkinTwo = `<option value="build">- Default Skin (Elite 2)</option>`;
    htmlContent += defaultSkinTwo;
  }

  compareItem.innerHTML += htmlContent;
}

function compareOriginal() {
  const viewerCheckbox = document.querySelector(".viewer-checkbox-compare")
  const compareDiv = document.querySelector(".compare-div")

  const icon = document.querySelector(".viewer-icon img")
  const art = document.getElementById("full-image")
  const skinName = document.querySelector(".viewer-skin-name")

  // where should i append the e2 art button
  const viewerRowCheckbox = document.querySelector(".viewer-row-checkbox")

  if (viewerCheckbox.checked) {

    //console.log("truers")
    skinsData.forEach(data => {
      if (data.skinNameEN == skinName.textContent) {
        //console.log("match")
        icon.src = `https://raw.githubusercontent.com/HermitzPlanner/operator-icon/main/e0/${data.modelNameCN}.png`
        //art.src = `https://raw.githubusercontent.com/HermitzPlanner/operator-art/main/e0/${data.modelNameCN}.png`



        // Create an Image object to test if the URL is valid
        const testImage = new Image();
        const baseImageUrl = "https://raw.githubusercontent.com/HermitzPlanner/operator-art/main/";
        const operatorName = data.modelNameCN;

        // Define the full image and fallback image URLs
        const fullImageUrl = `${baseImageUrl}e2/${operatorName}.png`;
        const fallbackImageUrl = `${baseImageUrl}e0/${operatorName}.png`;

        // Set up the onload and onerror event handlers
        testImage.onload = function () {
          // If the full image is valid, set it as the viewer's src
          art.src = fullImageUrl;
        };

        testImage.onerror = function () {
          // If the full image is not valid, use the fallback image
          art.src = fallbackImageUrl;
        };

        // Attempt to load the full image
        testImage.src = fullImageUrl;



        skinName.textContent = "Default outfit"
        compareDiv.textContent = "Back to skin"

        let plannerId = data.plannerId
        if (!isNaN(plannerId.slice(-1))) {
          // Replace the last character with '0'
          plannerId = plannerId.slice(0, -1) + "0";
        }

        let skinId = data.skinId.toLowerCase()
        // Step-by-step breakdown:
        let parts = skinId.split("_"); // Split the string by '_'
        parts.splice(-2); // Remove the last two elements
        let result = parts.join("_"); // Join the remaining parts back together with '_'



        chibiUpdate(plannerId, result, "operator-")
      }
    });

  } else {
    //console.log("fals")
    //console.log("originalIconUrl", originalIconUrl)
    icon.src = originalIconUrl
    art.src = originalArtUrl
    skinName.textContent = originalSkinName
    compareDiv.textContent = "Compare with original"

    //console.log("globalPlannerId", globalPlannerId)
    //console.log("globalSkinId", globalSkinId)

    chibiUpdate(originalPlannerId, originalSkinId, null)
  }
}


function chibiArt(amongus) {
  document.getElementById("full-image").style.top = "0px"
    document.getElementById("full-image").style.left = "0px"

    document.getElementById("full-image").style.display = "flex"
    document.getElementById("viewer-information").style.display = "none"
    document.getElementById("full-image-hide-art").style.display = "block"
}

function fullImageBack(amongus) {
  document.getElementById("full-image").style.display = "none"
  document.getElementById("viewer-information").style.display = "flex"
  document.getElementById("full-image-hide-art").style.display = "none"
}