async function main() {
    // TODO fix poo
    // TODO something for when there's negative primes in the current
    // TODO pinterest addon
    const plannerEventsBodyTemplate = document.getElementById("planner-events-body")
    const plannerSkinsBodyTemplate = document.getElementById("planner-skins-body")
    const summaryBodyTemplate = document.getElementById("summary-body")
    const summarySkinsBody = document.getElementById("summary-skins-body")

    const plannerEventsCall = await fetch('https://raw.githubusercontent.com/HermitzPlanner/hermitzplanner.github.io/main/json/events.json')
    //const plannerEventsCall = await fetch('json/events.json')
    const plannerEventsData = await plannerEventsCall.json()

    const plannerSkinsCall = await fetch('json/table_data.json')
    const plannerSkinsData = await plannerSkinsCall.json()

    let rewards = 0
    let counter = 1

    plannerEventsData.forEach(plannerEvent => {
        // Config
        //if (counter == 5) { return }
        if (plannerEvent.status === "end") return;
        if (plannerEvent.eventcode == "warmupeventforch12") return;
        if (plannerEvent.eventcode == "warmupeventforch13") return;
        if (plannerEvent.eventcode == "0011yunseries") { plannerEvent.event = "0011 / Yun Series" }

        let currentPrimes = 0
        if (counter > 1) {
            currentPrimes = rewards
        }


        // Import node
        const eventsNode = document.importNode(plannerEventsBodyTemplate.content, true);
        const summaryNode = document.importNode(summaryBodyTemplate.content, true)

        // Modify node
        const plannerEventsCboxClone = eventsNode.querySelector(".planner-events-cbox")
        plannerEventsCboxClone.setAttribute("id", "planner-events-cbox-" + plannerEvent.eventcode)
        plannerEventsCboxClone.setAttribute("name", plannerEvent.eventcode)

        const plannerEventsCboxLabelClone = eventsNode.querySelector(".planner-events-cbox-label")
        plannerEventsCboxLabelClone.htmlFor = "planner-events-cbox-" + plannerEvent.eventcode
        plannerEventsCboxLabelClone.setAttribute("id", "event-" + plannerEvent.eventcode)

        const summaryContainer = summaryNode.querySelector(".summary-skins-container-scroll")
        summaryContainer.classList.add("summary-" + plannerEvent.eventN)

        const plannerEventsNameClone = eventsNode.querySelector(".planner-events-name")
        plannerEventsNameClone.textContent = plannerEvent.event + " " + plannerEvent.type
        const plannerEventsImageClone = eventsNode.querySelector(".planner-events-image img")
        plannerEventsImageClone.src = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/events/resized/resized_" + plannerEvent.eventcode + ".jpg"

        const summaryEventName = summaryNode.querySelector(".summary-events-name")
        summaryEventName.textContent = plannerEvent.event + " " + plannerEvent.type
        const summaryEventsImageClone = summaryNode.querySelector(".summary-events-image img")
        summaryEventsImageClone.src = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/events/resized/resized_" + plannerEvent.eventcode + ".jpg"



        const plannerEventsCalcs = eventsNode.querySelector(".planner-events-calcs")
        plannerEventsCalcs.setAttribute("id", "calc-event-" + plannerEvent.eventN)

        const plannerEventsCurrentValue = eventsNode.querySelector(".planner-events-current-value")
        plannerEventsCurrentValue.textContent = currentPrimes

        rewards += parseInt(plannerEvent.reward)
        const plannerEventsRewardValue = eventsNode.querySelector(".planner-events-reward-value")
        plannerEventsRewardValue.textContent = plannerEvent.reward
        plannerEventsRewardValue.classList.add("reward-event-" + plannerEvent.eventN)
        if (plannerEvent.reward !== "0") {
            plannerEventsRewardValue.classList.add("reward-value-" + plannerEvent.reward)
        }
        if (plannerEvent.reward == "0" && plannerEvent.rewardRerun !== "0") {
            plannerEventsRewardValue.classList.add("reward-value-" + plannerEvent.rewardRerun)
        }
        if (plannerEvent.reward == "0" && plannerEvent.rewardRerun == "0") {
            plannerEventsRewardValue.classList.add("reward-value-0")
        }
        // TODO better js and look for events with no prime rewards thanks

        const plannerEventsCostValue = eventsNode.querySelector(".planner-events-cost-value")
        plannerEventsCostValue.textContent = 0
        plannerEventsCostValue.classList.add("cost-event-" + plannerEvent.eventN)
        const plannerEventsTotalValue = eventsNode.querySelector(".planner-events-total-value")
        plannerEventsTotalValue.textContent = rewards
        plannerEventsTotalValue.classList.add("total-value-" + plannerEvent.eventN)

        const eventCounter = eventsNode.querySelector(".event-counter")
        eventCounter.textContent = counter

        // Export node
        document.querySelector(".planner-events-content").appendChild(eventsNode)
        document.querySelector(".summary-content").appendChild(summaryNode)

        // Skins sorting
        plannerSkinsData.slice().reverse().forEach(plannerSkin => {
            // Config
            if (!(plannerEvent.newSkins.indexOf(plannerSkin.plannerId) !== -1 || plannerEvent.rerunSkins.indexOf(plannerSkin.plannerId) !== -1 || plannerSkin.fashionReview > 0 && plannerSkin.fashionReview <= plannerEvent.fashion)) { return }
            // Import node
            const skinsNode = document.importNode(plannerSkinsBodyTemplate.content, true);
            // Modify node
            const plannerSkinsCboxClone = skinsNode.querySelector(".planner-skins-cbox")
            plannerSkinsCboxClone.setAttribute("id", "planner-skins-cbox-" + plannerSkin.plannerId + "-event-" + plannerEvent.eventN)
            const plannerSkinsCboxLabelClone = skinsNode.querySelector(".planner-skins-cbox-label")
            plannerSkinsCboxLabelClone.htmlFor = "planner-skins-cbox-" + plannerSkin.plannerId + "-event-" + plannerEvent.eventN;
            plannerSkinsCboxLabelClone.classList.add(plannerEvent.eventcode)

            plannerSkinsCboxLabelClone.classList.add(plannerSkin.plannerId)
            plannerSkinsCboxLabelClone.classList.add("display-none")

            const plannerSkinsModelClone = skinsNode.querySelector(".planner-skins-model")
            plannerSkinsModelClone.textContent = plannerSkin.modelNameEN
            const plannerSkinsPriceClone = skinsNode.querySelector(".planner-skins-price")
            plannerSkinsPriceClone.textContent = plannerSkin.skinPrice
            const plannerSkinsImageClone = skinsNode.querySelector(".planner-skins-image img")
            plannerSkinsImageClone.src = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/portrait/" + plannerSkin.plannerId + ".png"

            const searchButtonsClone = skinsNode.querySelector(".search-button")
            searchButtonsClone.classList.add("search-" + plannerSkin.plannerId)



            // Export node
            document.querySelector(".planner-skins-content").appendChild(skinsNode)
        });
        counter++
    });
    // Remove margin from first event
    document.querySelector(".planner-events-body").style.margin = "0"

    // Alters
    var alters = document.querySelectorAll('.planner-skins-model');
    alters.forEach(function (alter) {
        var words = alter.textContent.split(' ');
        if (words.length >= 3) {
            alter.textContent = words[0] + ' Alter';
        }
    });

    


    // Current primes interaction
    const initialPrimesInput = document.getElementById('planner-events-initial-primes')
    initialPrimesInput.addEventListener('input', primesInput);
    function primesInput() {
        //console.log("%cInput", "color: white; font-size: 18px; background: blue;")
        let primesInputValue = parseInt(initialPrimesInput.value)
        if (primesInputValue == "") { console.log("empty value"); primesInputValue = 0 }
        const plannerEventsCurrentValue = document.querySelector(".planner-events-current-value")
        plannerEventsCurrentValue.textContent = primesInputValue
        //console.log(primesInputValue)
        calcules()
    }

    // Calcules
    const eventCalculesElements = document.querySelectorAll(".planner-events-calcs")
    function calcules() {

        let calculesCounter = 1
        eventCalculesElements.forEach(eventCalculeElement => {
            //console.log(eventCalculeElement)
            const eventNumber = parseInt(eventCalculeElement.id.replace("calc-event-", ""))
            const eventCurrentElement = eventCalculeElement.querySelector(".planner-events-current-value")
            const eventRewardElement = eventCalculeElement.querySelector(".planner-events-reward-value")
            const eventCostElement = eventCalculeElement.querySelector(".planner-events-cost-value")
            const eventTotalElement = eventCalculeElement.querySelector(".planner-events-total-value")

            let currentValue = ""
            if (calculesCounter !== 1) {
                const previousEventNumber = eventNumber - 1
                const previousEventTotalElement = document.querySelector(`.total-value-${previousEventNumber}`)
                const previousEventTotalValue = parseInt(previousEventTotalElement.textContent)
                currentValue = previousEventTotalValue
                eventCurrentElement.textContent = previousEventTotalValue
            } else {
                currentValue = parseInt(eventCurrentElement.textContent);
            }

            const eventCurrentValue = currentValue
            const eventRewardValue = parseInt(eventRewardElement.textContent);
            const eventCostValue = parseInt(eventCostElement.textContent);
            const eventTotalValue = eventCurrentValue + eventRewardValue + eventCostValue

            eventTotalElement.textContent = eventCurrentValue + eventRewardValue + eventCostValue

            calculesCounter++
        });
    } calcules()

    // Skins interaction + Cost interaction
    const skinsCboxAll = document.querySelectorAll(".planner-skins-cbox");
    skinsCboxAll.forEach(skinCbox => {
        skinCbox.addEventListener("click", () => {
            // Toggle the "checked" class
            skinCbox.nextElementSibling.children[0].classList.toggle("checked", skinCbox.checked);
            skinCbox.nextElementSibling.querySelector(".planner-skins-price").classList.toggle("checked", skinCbox.checked);
            skinCbox.nextElementSibling.querySelector(".planner-skins-price").classList.toggle("checked-text", skinCbox.checked);
            skinCbox.nextElementSibling.querySelector(".planner-skins-model").classList.toggle("checked-text", skinCbox.checked);
            // Extract the event number from the ID
            const skinCboxEventNumber = skinCbox.id.split('-').slice(-2).join('-');
            const eventNumber = skinCboxEventNumber.replace("event-", "")
            // Get skin price and current cost elements
            const skinPrice = parseInt(skinCbox.nextElementSibling.children[0].children[2].textContent);
            const costElement = document.querySelector(`.cost-${skinCboxEventNumber}`);
            const eventRewardElement = document.querySelector(`.reward-${skinCboxEventNumber}`);
            const eventRewardValue = parseInt(eventRewardElement.textContent)
            // Update the cost based on checkbox state
            const currentCost = parseInt(costElement.textContent);
            const currentTotal = skinCbox.checked ? currentCost - skinPrice : currentCost + skinPrice;
            // Update the cost element text content
            costElement.textContent = currentTotal;



            // Avoid clicking same skins
            const skinId = skinCbox.nextElementSibling.classList[2]
            const skinsOfSameId = document.querySelectorAll(`.${skinId}`)
            const originalName = skinCbox.nextElementSibling.querySelector(".planner-skins-model").textContent
            if (skinCbox.checked) {
                skinsOfSameId.forEach(skin => {
                    if (skin.htmlFor == skinCbox.id) {
                        return
                    }
                    skin.children[0].classList.add("checked-disabled")
                    skin.previousElementSibling.disabled = true
                    const skinOverlay = skin.querySelector(".skin-overlay")
                    skinOverlay.classList.add("overlay-true")
                    skin.querySelector(".planner-skins-model").textContent = "Already selected"
                });
            } else {
                skinsOfSameId.forEach(skin => {
                    if (skin.htmlFor == skinCbox.id) {
                        return
                    }
                    skin.children[0].classList.remove("checked-disabled")
                    skin.previousElementSibling.disabled = false
                    const skinOverlay = skin.querySelector(".skin-overlay")
                    skinOverlay.classList.remove("overlay-true")
                    skin.querySelector(".planner-skins-model").textContent = originalName
                });
            }

            // Sending skin to summary
            // Import node
            const summarySkinsNode = document.importNode(summarySkinsBody.content, true);

            // Edit node
            const summarySkin = summarySkinsNode.querySelector(".summary-skins-body")
            summarySkin.setAttribute("id", `summary-${eventNumber}-${skinId}`)
            const skinName = skinCbox.nextElementSibling.querySelector(".planner-skins-model").textContent

            const summarySkinName = summarySkinsNode.querySelector(".summary-events-name")
            summarySkinName.textContent = skinName
            const summarySkinImage = summarySkinsNode.querySelector(".summary-events-image img")
            summarySkinImage.src = "https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/icon/" + skinId + ".png"

            if (skinCbox.checked) {
                // Export node
                document.querySelector(`.summary-${eventNumber}`).appendChild(summarySkinsNode)
            } else {
                document.getElementById(`summary-${eventNumber}-${skinId}`).remove()
            }

            calcules()
        });
    });

    // Viewer attachment
    const searchButtons = document.querySelectorAll(".search-button")
    searchButtons.forEach(button => {
        button.addEventListener("click", () => {
            const plannerId = button.classList[1]

            viewer(plannerId.replace("search-", ""))
        })
    });

    // Events handling
    let eventSelection = ""
    const eventsCboxAll = document.querySelectorAll(".planner-events-cbox")
    eventsCboxAll.forEach(eventCbox => {
        eventCbox.addEventListener("change", () => {
            if (eventCbox.checked) {
                //console.log("%cTRUE", "color: white; font-size: 18px; background: green;", eventCbox);
                eventCbox.nextElementSibling.children[0].classList.add("checked", "event-checked")
                // Redirection hash
                eventSelection = eventCbox.name
                window.location.hash = eventSelection;
                // Background change
                const plannerSkinsContent = document.querySelector(".planner-skins")
                plannerSkinsContent.style.backgroundImage = `linear-gradient(rgba(13, 13, 13, 0.82), rgba(3, 3, 3, 0.90)), url(https://raw.githubusercontent.com/HermitzPlanner/planner-images/main/events/${eventSelection}.jpg)`;
                plannerSkinsContent.style.backgroundRepeat = "no-repeat";
                plannerSkinsContent.style.backgroundPosition = "center";
                plannerSkinsContent.style.backgroundSize = "cover";
                // Skins header change
                const plannerSkinsHeader = document.querySelector(".planner-skins-header-event")
                plannerSkinsHeader.textContent = eventCbox.nextElementSibling.children[0].children[0].children[0].textContent
                // Enabel or disable reward
                const headerReward = document.querySelector(".planner-skins-header-reward")
                const eventNumber = parseInt(eventCbox.nextElementSibling.children[0].children[1].id.replace("calc-event-", ""))
                console.log("old", headerReward.classList[1])
                var classes = headerReward.classList;
                var secondClass = classes[1];
                // Modify the second class (for example, add a new class)
                classes.replace(secondClass, eventNumber);
                // Update the element with the modified classList
                headerReward.className = classes.toString();
                console.log("new", headerReward.classList[1])

                let enableOrDisable = ""
                //console.log(eventCbox.nextElementSiblingt.querySelector(".planner-events-reward-value"))
                const eventReward = parseInt(eventCbox.nextElementSibling.querySelector(".planner-events-reward-value").textContent)
                eventReward > 0 ? enableOrDisable = "Disable Reward" : enableOrDisable = "Enable Reward"
                headerReward.textContent = enableOrDisable



            } else {
                eventCbox.nextElementSibling.children[0].classList.remove("checked", "event-checked")
                //console.log("%cFALSE", "color: white; font-size: 18px; background: red;", eventCbox);
            }
            // Uncheck
            eventsCboxAll.forEach(otherEventCbox => {
                if (otherEventCbox.checked) {
                    if (otherEventCbox.id == eventCbox.id) { return }
                    //console.log("%cOTHER TRUE", "color: white; font-size: 18px; background: blue;", otherEventCbox);
                    otherEventCbox.nextElementSibling.children[0].classList.remove("checked", "event-checked")
                    otherEventCbox.checked = false
                }

            });
            // Show skin
            skinsCboxAll.forEach(skinCbox => {
                const nextElement = skinCbox.nextElementSibling;
                if (nextElement.classList.contains(eventSelection)) {
                    nextElement.classList.remove("display-none");
                } else if (!nextElement.classList.contains("display-none")) {
                    nextElement.classList.add("display-none");
                }
            });
        })
    });

    // Enable or disable reward
    const headerReward = document.getElementById("header-reward")
    headerReward.addEventListener("click", () => {
        const headerRewardElement = document.querySelector(".planner-skins-header-reward")
        const eventNumber = headerReward.nextElementSibling.children[0].classList[1]

        const plannerRewardElement = document.querySelector(`.reward-event-${eventNumber}`)
        const plannerRewardOriginalValue = document.querySelector(`.reward-event-${eventNumber}`).classList[3].replace("reward-value-", "")
        //console.log(plannerRewardElement)
        console.log("original value", plannerRewardOriginalValue)
        const state = headerRewardElement.textContent.split(" ")[0];
        //console.log("state", state)
        if (state === "Disable") {
            headerRewardElement.textContent = "Enable reward"
            plannerRewardElement.textContent = 0

        } else {
            headerRewardElement.textContent = "Disable reward"
            plannerRewardElement.textContent = plannerRewardOriginalValue
        }
        calcules()
        calcules()
    })

    // Redirection
    let newHash = location.hash.substring(1).replace("event-", "")
    //if (location.hash.substring(1).includes("event-")) {
    //location.hash.substring(1).replace("event-", "")
    //}
    if (location.hash.substring(1).includes("skin-")) {
        viewer(location.hash.substring(1).replace("skin-", ""))
    } else {
        document.getElementById("event-" + newHash).click()
    }
    //document.getElementById(newHash).click()
    window.location.hash = "event-" + newHash
    window.location.hash = newHash

    // TODO -> window change on typing -> window.addEventListener("hashchange", function () {});


    // Get all elements with class ".planner-events-name"
    var elements = document.querySelectorAll('.planner-events-name');
    // Iterate through each element and process its content
    elements.forEach(function (element) {
        var content = element.textContent;
        // Use a regular expression to find the word "Rerun"
        var regex = /\bRerun\b/g;
        var highlightedContent = content.replace(regex, function (match) {
            return '<span class="rerun">' + match + '</span>';
        });
        // Update the content of the element with the highlighted words
        if (highlightedContent !== content) {
            element.innerHTML = highlightedContent;
        }
    });

    const calcTexts = document.querySelectorAll(".calc-text")
    let calcTextCounter = 0
    calcTexts.forEach(calcText => {

        //if (calcTextCounter > 3) {calcText.style.display = "none"} 
        calcTextCounter++
    });

} main()