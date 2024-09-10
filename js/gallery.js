let link = ""
let users = []
let brandSelect = ""
let brand;
let selectedSkin = ""

async function headerGallery() {
    const headerGalleryButton = document.getElementById("header-gallery")
    const headerGalleryImg = document.querySelector(".header-item img")
    const headerGalleryText = document.querySelector(".header-gallery-text")
    const plannerBody = document.querySelector(".planner-body")
    const galleryBody = document.querySelector(".gallery")

    const plannerSkinsCall = await fetch('https://raw.githubusercontent.com/HermitzPlanner/hermitzplanner.github.io/main/json/table_data.json')
    const plannerSkinsData = await plannerSkinsCall.json()


    // TODO automate this brand thing
    const search = document.getElementById('search2')
    const brandResponse = await fetch('https://raw.githubusercontent.com/HermitzPlanner/hermitzplanner.github.io/main/json/brand.json'); // grab json
    const brandData = await brandResponse.json(); // wait for json and make it data
    brandData.sort();
    brandData.forEach(brand => {
        search.innerHTML += `<option value="${brand}">${brand}</option>`
    });
    

    // brandData.forEach(function (datajson) {
    //     search.innerHTML += `
    //     <option value="${datajson.brand}">${datajson.brand}</option>
    //     `
    // })

    if (headerGalleryButton.checked) {
        plannerBody.style.display = "none"
        galleryBody.style.display = "flex"
        headerGalleryImg.src = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/planner.svg"
        headerGalleryText.textContent = "Planner"
        gallerySorting()
    } else {
        plannerBody.style.display = "flex"
        galleryBody.style.display = "none"
        headerGalleryImg.src = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/svg/gallery.svg"
        headerGalleryText.textContent = "Gallery"
    }

    async function gallerySorting() {
        const galleryBodyTemplate = document.getElementById("gallery-body")
        plannerSkinsData.slice().reverse().forEach(plannerSkin => {
            // Import node
            const galleryNode = document.importNode(galleryBodyTemplate.content, true);
            // Modify node
            const galleryLinkClone = galleryNode.querySelector(".gallery-link")
            galleryLinkClone.href = "#skin-" + plannerSkin.plannerId
            galleryLinkClone.setAttribute("id", `gallery-${plannerSkin.plannerId}`)

            const galleryBtnClone = galleryNode.querySelector(".gallery-btn");
            galleryBtnClone.setAttribute("id", "skin-" +  plannerSkin.plannerId)
            

            const galleryImgClone = galleryNode.querySelector(".gallery-img");
            galleryImgClone.src = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/icon/" + plannerSkin.plannerId + ".png"
            const galleryModelClone = galleryNode.querySelector(".gallery-model")
            galleryModelClone.textContent = plannerSkin.modelNameEN
            const gallerySubClone = galleryNode.querySelector(".gallery-sub");
            plannerSkin.skinNameEN = plannerSkin.skinNameEN || plannerSkin.skinNameCN;
            gallerySubClone.textContent = plannerSkin.skinNameEN

            const cardBgClone = galleryNode.querySelector(".card-bg");
            const galleryFadeClone = galleryNode.querySelector(".gallery-fade");

            // Export node
            document.querySelector("#gallery").appendChild(galleryNode)
            const icon = document.getElementById(`gallery-${plannerSkin.plannerId}`)
            users.push({ name: plannerSkin.modelNameEN, brand: plannerSkin.brand, element: icon })
        });

        const gallerySub = document.querySelectorAll('.gallery-sub')
        gallerySub.forEach(element => {
            if (element.innerHTML.length > 24) {
                element.style.fontSize = "12px";
            }
        });

        const galleryBtn = document.querySelectorAll(".gallery-btn")
        galleryBtn.forEach(btn => {
           btn.addEventListener("click", () => {
            window.location.hash = btn.id
            viewer(btn.id.replace("skin-", ""))
           }) 
           
        });
    }

    // name filter
    // document.getElementById("gallery-gavialalter1").classList.add("amogsdgsdsdgkj")
    const searchInput = document.getElementById("search")
    searchInput.addEventListener("input", e => {
        const value = e.target.value.toLowerCase()
        //console.log("e", e)
        //console.log(users)
        users.forEach(user => {
            const isVisible = user.name.toLowerCase().includes(value) && user.brand.includes(brandSelect)
            const sugmaball = document.getElementById(user.element.id)
            sugmaball.classList.toggle("invisible", !isVisible)
        })
    })

    // brand filter
    const brandFilter = document.getElementById("search2")
    brandFilter.addEventListener("change", b => {
        brand = document.getElementById('search2').value
        brandSelect = brand
        users.forEach(user => {
            const isVisible = user.brand.includes(brand)
            const sugmaball = document.getElementById(user.element.id)
            sugmaball.classList.toggle("invisible", !isVisible)
        })
    })

    var alters2 = document.querySelectorAll('.gallery-model');
            alters2.forEach(function (alter) {
                var words = alter.textContent.split(' ');
                if (words.length >= 3 && alter.textContent !== "Terra Research Commission") {
                    alter.textContent = words[0] + ' Alter';
                }
            });
}
