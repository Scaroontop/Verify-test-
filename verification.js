const extensions = {
    "no-direct-ip": "chrome-extension://hacaeeoapmdgmhifjcgbblcobgnmceff/icons/block.png",
    "Securly (4th ID)": "chrome-extension://lcgajdcbmhepemmlpemkkpgagieehmjp/fonts/Metropolis.css",
    "Securly (3rd ID)": "chrome-extension://ckecmkbnoanpgplccmnoikfmpcdladkc/fonts/Metropolis.css",
    "Securly (2nd ID)": "chrome-extension://joflmkccibkooplaeoinecjbmdebglab/fonts/Metropolis.css",
    "Securly (1st ID)": "chrome-extension://iheobagjkfklnlikgihanlhcddjoihkg/fonts/Metropolis.css",
    "GoGuardian": "chrome-extension://haldlgldplgnggkjaafhelgiaglafanh/youtube_injection.js",
    "LANSchool": "chrome-extension://baleiojnjpgeojohhhfbichcodgljmnj/blocked.html",
    "Linewize": "chrome-extension://ddfbkhpmcdbciejenfcolaaiebnjcbfc/background/assets/pages/default-blocked.html",
    // Add more extensions as needed...
};

const STORAGE_KEY = "verification-status";

function checkExtensions() {
    if (localStorage.getItem(STORAGE_KEY) === "verified") {
        loadContent();
        return;
    }

    const promises = Object.entries(extensions).map(([name, url]) =>
        fetch(url, { method: 'HEAD' })
            .then(() => name)
            .catch(() => null)
    );

    Promise.all(promises).then(results => {
        const validExtensions = results.filter(name => name !== null);
        const statusElement = document.getElementById('status');

        if (validExtensions.length > 0) {
            localStorage.setItem(STORAGE_KEY, "verified");
            statusElement.style.color = "green";
            statusElement.textContent = `Verified! Detected: ${validExtensions.join(', ')}`;
            loadContent();
        } else {
            statusElement.textContent = "No compatible extensions detected.";
        }
    });
}

function loadContent() {
    document.getElementById('status').style.display = "none";
    document.getElementById('content').style.display = "block";
}

checkExtensions();
