const extensions = {
    "no-direct-ip": "chrome-extension://hacaeeoapmdgmhifjcgbblcobgnmceff/icons/block.png",
    "Securly (4th ID)": "chrome-extension://lcgajdcbmhepemmlpemkkpgagieehmjp/fonts/Metropolis.css",
    "Securly (3rd ID)": "chrome-extension://ckecmkbnoanpgplccmnoikfmpcdladkc/fonts/Metropolis.css",
    "Securly (2nd ID)": "chrome-extension://joflmkccibkooplaeoinecjbmdebglab/fonts/Metropolis.css",
    "Securly (1st ID)": "chrome-extension://iheobagjkfklnlikgihanlhcddjoihkg/fonts/Metropolis.css",
    "GoGuardian": "chrome-extension://haldlgldplgnggkjaafhelgiaglafanh/youtube_injection.js",
    // Add more extensions as needed...
};

const STORAGE_KEY = "verification-status";

function checkExtensions() {
    const statusElement = document.getElementById('status');
    const spinner = document.getElementById('spinner');
    const content = document.getElementById('content');
    const failure = document.getElementById('failure');

    // Check if already verified
    if (localStorage.getItem(STORAGE_KEY) === "verified") {
        statusElement.style.color = "blue";
        statusElement.textContent = "Already verified. Please wait for the redirect...";
        spinner.style.display = "none";
        content.classList.remove('hidden');
        setTimeout(() => redirectToPage(), 3000); // Simulate redirect
        return;
    }

    // Perform verification if not verified
    const promises = Object.entries(extensions).map(([name, url]) =>
        fetch(url, { method: 'HEAD' })
            .then(() => name)
            .catch(() => null)
    );

    Promise.all(promises).then(results => {
        const validExtensions = results.filter(name => name !== null);

        if (validExtensions.length > 0) {
            localStorage.setItem(STORAGE_KEY, "verified");
            statusElement.style.color = "green";
            statusElement.textContent = `Successful verification: Please wait for the redirect...`;
            spinner.style.display = "none";
            content.classList.remove('hidden');
            setTimeout(() => redirectToPage(), 3000); // Simulate redirect
        } else {
            statusElement.style.color = "red";
            statusElement.textContent = `Failed to verify.`;
            spinner.style.display = "none";
            failure.classList.remove('hidden');
        }
    });
}

function redirectToPage() {
    window.location.href = "https://your-redirect-url.com"; // Replace with your redirect URL
}

checkExtensions();
