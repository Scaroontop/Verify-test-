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
    const success = document.getElementById('success');
    const failure = document.getElementById('failure');
    const alreadyVerified = document.getElementById('already-verified');

    // Check if already verified
    if (localStorage.getItem(STORAGE_KEY) === "verified") {
        statusElement.textContent = "";
        spinner.classList.add('hidden');
        alreadyVerified.classList.remove('hidden');
        setTimeout(() => redirectToPage(), 3000); // Simulate redirect
        return;
    }

    // Perform verification
    const promises = Object.entries(extensions).map(([name, url]) =>
        fetch(url, { method: 'HEAD' })
            .then(() => name)
            .catch(() => null)
    );

    Promise.all(promises).then(results => {
        const validExtensions = results.filter(name => name !== null);

        spinner.classList.add('hidden');

        if (validExtensions.length > 0) {
            localStorage.setItem(STORAGE_KEY, "verified");
            success.classList.remove('hidden');
            statusElement.textContent = `Successfully verified: Redirecting...`;
            setTimeout(() => redirectToPage(), 3000); // Redirect
        } else {
            failure.classList.remove('hidden');
            statusElement.textContent = "Failed to verify.";
        }
    });
}

function redirectToPage() {
    window.location.href = "https://your-redirect-url.com"; // Replace with your URL
}

checkExtensions();
