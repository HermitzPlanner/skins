let animationList = ''

const app = new PIXI.Application({
    width: 800,
    height: 400,
    //backgroundAlpha: 0,
    premultiplyAlpha: true,
    antialias: true,
    backgroundColor: 0x111014,

});



let skinSpine

function renderCanvas(plannerId, skinName, skinsData, perspective = 'front') {

    const skinObject = findSkinByName(skinsData.cnData, skinName)
    const skinId = skinObject.avatarId.replace('#', '_').toLowerCase()
    let animation = perspective == 'build' ? 'Relax' : 'Start'
    const chibiExntension = plannerId == 'texasalter2' ? '.json' : '.skel'
    const chibiRepo = `https://raw.githubusercontent.com/HermitzPlanner/${'chibi-assets'}/main/${plannerId}/${perspective}/${skinId}${chibiExntension}`;
    const chibiRepoBuild = `https://raw.githubusercontent.com/HermitzPlanner/${'chibi-assets'}/main/${plannerId}/${perspective}/build_${skinId}${chibiExntension}`;

    PIXI.Assets.load(chibiRepo)
        .then((skinAsset) => {
            renderSkinSpine(plannerId, perspective, animation, skinAsset);
        })
        .catch((error) => {
            console.error('Failed to load primary asset:', error);
            PIXI.Assets.load(chibiRepoBuild)
                .then((fallbackAsset) => {
                    renderSkinSpine(plannerId, perspective, animation, fallbackAsset);
                })
                .catch((fallbackError) => {
                    console.error('Failed to load fallback asset:', fallbackError);
                    // Optionally, handle the scenario where both load attempts fail
                    // For example, you might want to show an error message or use a default asset
                });
        });

}

function renderSkinSpine(plannerId, perspective, animation, skinAsset) {
    document.querySelector('.chibi-buttons').classList.remove('hide')
    document.querySelector('.chibi-buttons').classList.add('show')
    skinSpine = new PIXI.spine.Spine(skinAsset.spineData);

    mulberryCheck(plannerId, perspective)

    animationList = skinSpine.spineData.animations

    // Spine settings
    skinSpine.x = app.screen.width / 2;
    if (animation !== 'Sit') {
        skinSpine.y = app.screen.height;
    } else {
        skinSpine.y = app.screen.height / 2;
    }
    skinSpine.scale.set(0.8)
    // Assuming 'skinSpine' is your Spine object and 'animation' is the variable holding the animation name
    if (perspective !== 'build') {
        if (skinSpine.spineData.findAnimation('Start')) {
            skinSpine.state.setAnimation(0, 'Start', false);
        } else {
            skinSpine.state.setAnimation(0, 'Start_A', false);
        }
    } else {
        skinSpine.state.setAnimation(0, 'Relax', true);
    }
    skinSpine.interactive = true;
    skinSpine.buttonMode = true;
    skinSpine.alpha = 1;

    // Listen for the complete event to trigger the 'Idle' animation
    skinSpine.state.addListener({
        complete: (event) => {
            if (event.animation.name === animation && perspective !== 'build') {
                skinSpine.state.setAnimation(0, 'Idle', true); // Play 'Idle' animation once the first one finishes
            }
        }
    });

    // App send
    app.stage.addChild(skinSpine);
    app.renderer.render(app.stage);

}

function mulberryCheck(plannerId, perspective) {
    if (plannerId == "mulberry2") {
        if (perspective == "front" || perspective == "build") {
            skinSpine.spineData.bones[207].transformMode = 0
            skinSpine.spineData.bones[211].transformMode = 0
        } if (perspective == "back") {
            skinSpine.spineData.bones[34].transformMode = 0
            skinSpine.spineData.bones[39].transformMode = 0
        }
    }
}