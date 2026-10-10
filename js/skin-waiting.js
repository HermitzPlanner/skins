export function skinWaiting(data) {
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
}