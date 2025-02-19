function summary() {
    const container = getDiv('summary');
    resetDiv('summary');

    const button = document.createElement('button')
    button.classList.add('toggle-button')
    button.style.width = "fit-content"
    button.style.margin = '0 auto'
    button.style.marginTop = '10px'
    button.style.fontSize = '110%'
    button.onclick = () => showSection('main');

    button.textContent = 'Back to planner'

    container.append(button)

    const selectedSkins = [];
    document.querySelectorAll('input[name="skin-cbox"]').forEach(skinCbox => {
        if (skinCbox.checked) {
            selectedSkins.push({
                plannerId: skinCbox.getAttribute('data-plannerId'),
                eventId: skinCbox.parentElement.getAttribute('data-event'),
                modelName: skinCbox.parentElement.getAttribute('data-model'),
                eventName: skinCbox.parentElement.getAttribute('data-eventName'),
            });
        }
    });

    const groupedEvents = selectedSkins.reduce((acc, { plannerId, eventId, modelName, eventName }) => {
        if (!acc[eventId]) {
            acc[eventId] = {
                planners: [], // Store objects with plannerId and modelName
                eventName: eventName
            };
        }
        acc[eventId].planners.push({ plannerId, modelName });
        return acc;
    }, {});

    Object.entries(groupedEvents).forEach(([eventId, { planners, eventName }]) => {
        container.append(summaryRow(eventId, planners, eventName));
    });

    debug(groupedEvents);
}

