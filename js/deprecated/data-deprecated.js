const missingAssets = []
let fetchedEventsData
let fetchedOperatorsData

function main(skinsData, eventsData, charData) {

    eventsData.slice().reverse().forEach((event, index) => {

        const containerOfSkins = getDiv('container-of-skins')

        if (event[0].startsWith('fashion')) {
            // Extract only the first number from "fashion review X (extra text)"
            const match = event[0].match(/\d+/);
            const maxFashionReview = match ? parseInt(match[0], 10) : 0;

            Object.keys(fashionReview)
                .map(Number) // Convert keys to numbers
                .filter(review => review <= maxFashionReview) // Keep only numbers ≤ maxFashionReview
                .sort((a, b) => b - a) // Sort for consistency
                .forEach(review => {
                    fashionReview[review].forEach(fashionSkin => {
                        containerOfSkins.append(skinContainer(event, fashionSkin, skinsData, 'icon'));
                    });
                });
        }




    });

    //document.getElementById('default-language').click()

    

}