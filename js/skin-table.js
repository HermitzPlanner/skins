export function skinTable(data) {
    return
    const skinTable = document.createElement("div")
    skinTable.style.width = "100%"
    skinTable.style.height = "100%"
    skinTable.style.zIndex = "99"
    skinTable.style.background = "#000"
    skinTable.style.position = "absolute"
    skinTable.style.overflowY = 'scroll'
    skinTable.innerHTML = `
    <table border="1" style="border-collapse: collapse;">
        <thead>
            <tr style="background-color: #f0f0f009;">
                <th style="padding: 8px;">Model</th>
                <th style="padding: 8px;">Skin</th>
                <th style="padding: 8px;">getTime</th>
                <th style="padding: 8px;">Price</th>
                <th style="padding: 8px;">Fashion Number</th>
            </tr>
        </thead>
        <tbody id="skinTableBody">
            <!-- Acá van las filas -->
        </tbody>
    </table>`;

    document.body.append(skinTable)

    const tbody = document.getElementById('skinTableBody');

    const skinsData = data.skinsData.cnData.charSkins
    const sortedDataSkins = Object.entries(skinsData)
        .sort(([, a], [, b]) => a.displaySkin.getTime - b.displaySkin.getTime)
        .map(([key, skin]) => skin);   // si solo querés los objetos

    Object.entries(sortedDataSkins).forEach(([key, value]) => {
        if (!value.isBuySkin) return
        const displaySkin = value.displaySkin
        const getTime = displaySkin.getTime
        const edition = getEditionFromTimestamp(getTime);
        const skinGroupId = displaySkin.skinGroupId
        const brand = data.skinsData.cnData.brandList[skinGroupId?.split('#')[1]]?.brandCapitalName || 'CROSSOVER'
        if (brand == 'CROSSOVER') return

        let price = 0
        if (displaySkin.obtainApproach == '采购中心') {
            price = 18
            if (value.dynIllustId) price = 21
            if (value.dynEntranceId) price = 24
        }

        if (price !== 18) return

        const row = document.createElement('tr');
        row.innerHTML = `
        <td style="padding: 8px;">${displaySkin.modelName || '-'}</td>
        <td style="padding: 8px;">${displaySkin.skinName || '-'}</td>
        <td style="padding: 8px;">${getTime || 'Sin fecha'}</td>
        <td style="padding: 8px; text-align: center;">${price}</td>
        <td style="padding: 8px; text-align: center; 
        color: hsl(${edition * 15}, 100%, 50%);
        background: hsl(${edition * 15}, 20%, 10%)";">${edition}</td>
    `;

        tbody.appendChild(row);

        //skinTable.innerHTML += `<div>
        //modelName: ${displaySkin.modelName}, skinName :${displaySkin.skinName}, getTime: ${getTime}, price: ${price}
        //</div>`
    });



}

const fashionReviews = [
    { edition: 1, timestamp: 1571126400 },
    { edition: 2, timestamp: 1577174400 },
    { edition: 3, timestamp: 1584432000 },
    { edition: 4, timestamp: 1594281600 },
    { edition: 5, timestamp: 1600920000 },
    { edition: 6, timestamp: 1608177600 },
    { edition: 7, timestamp: 1618459200 },
    { edition: 8, timestamp: 1625198400 },
    { edition: 9, timestamp: 1633075200 },
    { edition: 10, timestamp: 1635739200 },
    { edition: 11, timestamp: 1649908800 },
    { edition: 12, timestamp: 1656993600 },
    { edition: 13, timestamp: 1667275200 },
    { edition: 14, timestamp: 1671076800 },
    { edition: 15, timestamp: 1678161600 },
    { edition: 16, timestamp: 1689667200 },
    { edition: 17, timestamp: 1697961600 },
    { edition: 18, timestamp: 1705564800 }
];

function getEditionFromTimestamp(getTime) {
    let edition = 0

    if (getTime > fashionReviews[fashionReviews.length - 1].timestamp) return edition

    fashionReviews.slice().reverse().forEach((review, index) => {
        if (getTime <= review.timestamp) edition = review.edition 
    });

    return edition
}