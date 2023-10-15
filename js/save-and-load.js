function headerReset() {
    const skinElements = document.querySelectorAll(".planner-skins-cbox");
    skinElements.forEach(skin => {
        if (skin.checked) {
            skin.click()
        }
    });
}

function headerSave() {
    // Save current
    const currentPrimes = document.getElementById("planner-events-initial-primes").value
    console.log(currentPrimes)
    // Save skins
    const skinElements = document.querySelectorAll(".planner-skins-cbox");
    let selectedSkins = []
    skinElements.forEach(skin => {
        if (skin.checked) {
            const skinId = skin.id
            selectedSkins.push(skinId)
            console.log(selectedSkins)
        }
    });
    // TODO Event reward state + theme switch
    const eventRewards = document.querySelectorAll(".planner-events-reward-value")
    eventRewards.forEach(event => {
        if (event.textContent > 0) {
        }
    });
    // File writing 
    var content = JSON.stringify(selectedSkins) + '\n' + "currentPrimes" + '\n' + "theme" + '\n' + "JSON.stringify(rewardCheck)";
    // Create a Blob object to represent the data as a file
    var file = new Blob([content], { type: 'text/plain' });
    // Create a URL for the Blob object
    var url = URL.createObjectURL(file);
    // Create a link element and set its attributes
    var link = document.createElement('a');
    link.href = url;
    link.download = 'planner-selection.txt';
    // Append the link to the document body
    document.body.appendChild(link);
    // Click the link to download the file
    link.click();
    // Remove the link from the document body
    document.body.removeChild(link);

}

var content
var contentarray
var contentarrayReward

function headerLoad() {

    // Get the file input element
    var input = document.getElementById('header-load');

    // Get the first file from the input element's files property
    var file = input.files[0];

    // Create a new FileReader object
    var reader = new FileReader();

    // Set up an event listener for when the file has been read
    reader.onload = function () {
        var lines = reader.result.split('\n');
        var variable1 = lines[0].trim();
        var variable2 = lines[1].trim();
        var variable3 = lines[2].trim();
        var variable4 = lines[3].trim();

        // variable1
        contentarray = JSON.parse(variable1);
        contentarray.forEach(divs => {
            console.log(divs)
            var element = document.getElementById(divs);
            if (element) {
                if (element.checked !== true) {
                    element.click();
                }
            } else {
                // Handle the case when the element does not exist
                console.log(`Element with ID ${divs} does not exist.`);
            }
        })
       

        

    }

    // Read the file as text
    reader.readAsText(file);


}

