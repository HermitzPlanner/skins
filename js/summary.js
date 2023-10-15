

function summary() {
    //console.log("amogus")
    const plannerSkins = document.querySelector(".planner-skins")
    const plannerEvents = document.querySelector(".planner-events")
    const summary = document.querySelector(".summary")
    summaryContainerElements = document.querySelectorAll(".summary-container")
    if (window.getComputedStyle(summary).display === "none") {
        plannerSkins.style.display = "none"
        plannerEvents.style.display = "none"
        summary.style.display = "block"

        summaryContainerElements.forEach(summaryContainer => {
            if (summaryContainer.querySelector(".summary-skins-container-scroll").children.length == 0) {
                console.log("not have things")
                console.log(summaryContainer.querySelector(".summary-skins-container-scroll"))
                console.log(summaryContainer.querySelector(".summary-skins-container-scroll").children.length)
                //summaryContainer.style.display = "none"
            }

            function onlyNameDisplay() {
                if (!summaryContainer.querySelector(".summary-skins-container-scroll").children.length) {
                    summaryContainer.style.overflowX = "hidden"
                    summaryContainer.querySelector(".summary-events-calcs").style.display = "none"
                    summaryContainer.querySelector(".summary-events-image").style.display = "none"
                    summaryContainer.querySelector(".summary-events-info").style.width = "auto"
                    summaryContainer.querySelector(".summary-events-body").style.width = "fit-content"
                    summaryContainer.querySelector(".summary-events-body").style.height = "auto"
                } else {
                    summaryContainer.style.overflowX = "scroll"
                    summaryContainer.querySelector(".summary-events-calcs").style.display = "flex"
                    summaryContainer.querySelector(".summary-events-image").style.display = "flex"
                    summaryContainer.querySelector(".summary-events-info").style.width = "var(--planner-events-info-width)"
                    summaryContainer.querySelector(".summary-events-body").style.width = "var(--planner-events-width)"
                    summaryContainer.querySelector(".summary-events-body").style.height = "143.172px"
                }
            }
        });
    } else {
        plannerSkins.style.display = "block"
        plannerEvents.style.display = "block"
        summary.style.display = "none"
    }
}