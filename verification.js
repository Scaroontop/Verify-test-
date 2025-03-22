const extensions = {
    "no-direct-ip": "chrome-extension://hacaeeoapmdgmhifjcgbblcobgnmceff/icons/block.png",
    "Securly (4th ID)": "chrome-extension://lcgajdcbmhepemmlpemkkpgagieehmjp/fonts/Metropolis.css",
    "Securly (3rd ID)": "chrome-extension://ckecmkbnoanpgplccmnoikfmpcdladkc/fonts/Metropolis.css",
    "Securly (2nd ID)": "chrome-extension://joflmkccibkooplaeoinecjbmdebglab/fonts/Metropolis.css",
    "Securly (1st ID)": "chrome-extension://iheobagjkfklnlikgihanlhcddjoihkg/fonts/Metropolis.css",
    "GoGuardian": "chrome-extension://haldlgldplgnggkjaafhelgiaglafanh/youtube_injection.js",
};

const STORAGE_KEY = "verification-status";
const VERIFICATION_EXPIRY_KEY = "verification-expiry";
const USER_DATA_KEY = "verification-user-data";
const VERIFICATION_PAGE = "/verification.html";
const CURRENT_USER = "Scaroontop";
const CURRENT_UTC_TIME = "2025-03-22 08:33:53";

function saveUserData(verificationStatus) {
    const userData = {
        username: CURRENT_USER,
        verificationDate: CURRENT_UTC_TIME,
        status: verificationStatus,
        lastChecked: CURRENT_UTC_TIME
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

function checkVerificationStatus() {
    const verificationExpiry = localStorage.getItem(VERIFICATION_EXPIRY_KEY);
    const isVerified = localStorage.getItem(STORAGE_KEY) === "verified";
    const now = new Date().getTime();
    
    if (isVerified && verificationExpiry && parseInt(verificationExpiry) > now) {
        return true;
    }
    
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERIFICATION_EXPIRY_KEY);
    return false;
}

function showVerificationMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.id = 'verification-message';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'verification-content';
    messageContent.innerHTML = `
        <strong>Verification Required</strong>
        <span>You must complete the verification to access this page</span>
        <div class="user-info">User: ${CURRENT_USER}</div>
    `;
    
    messageDiv.appendChild(messageContent);
    document.body.prepend(messageDiv);
}

function checkExtensions() {
    const statusElement = document.getElementById('status');
    const spinner = document.getElementById('spinner');
    const success = document.getElementById('success');
    const failure = document.getElementById('failure');
    const alreadyVerified = document.getElementById('already-verified');
    const progressFill = document.querySelector('.progress-fill');

    if (checkVerificationStatus()) {
        statusElement.textContent = "";
        spinner.classList.add('hidden');
        progressFill.style.width = '100%';
        alreadyVerified.classList.remove('hidden');
        document.getElementById('user-info').textContent = `Verified User: ${CURRENT_USER}`;
        saveUserData("already-verified");
        setTimeout(() => redirectToPage(), 3000);
        return;
    }

    const promises = Object.entries(extensions).map(([name, url]) =>
        fetch(url, { method: 'HEAD' })
            .then(() => name)
            .catch(() => null)
    );

    Promise.all(promises).then(results => {
        const validExtensions = results.filter(name => name !== null);
        spinner.classList.add('hidden');
        progressFill.style.width = validExtensions.length > 0 ? '100%' : '30%';

        if (validExtensions.length > 0) {
            const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem(STORAGE_KEY, "verified");
            localStorage.setItem(VERIFICATION_EXPIRY_KEY, expiryTime.toString());
            saveUserData("verified");
            
            success.classList.remove('hidden');
            document.getElementById('user-info').textContent = `Verified User: ${CURRENT_USER}`;
            statusElement.textContent = `Verification successful! Redirecting...`;
            setTimeout(() => redirectToPage(), 3000);
        } else {
            failure.classList.remove('hidden');
            statusElement.textContent = "Verification failed. Required extensions not found.";
            document.getElementById('user-info').textContent = `Unverified User: ${CURRENT_USER}`;
            saveUserData("failed");
        }
    });
}

function redirectToPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');
    window.location.href = returnUrl || "https://your-redirect-url.com";
}

function addVerificationCheck() {
    if (window.location.pathname === VERIFICATION_PAGE) return;

    if (!checkVerificationStatus()) {
        showVerificationMessage();
        const currentPage = window.location.href;
        saveUserData("redirect-to-verification");
        
        setTimeout(() => {
            window.location.href = `${VERIFICATION_PAGE}?returnUrl=${encodeURIComponent(currentPage)}`;
        }, 2000);
    } else {
        const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || "{}");
        userData.lastChecked = CURRENT_UTC_TIME;
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
}

(function() {
    const existingMessage = document.getElementById('verification-message');
    if (existingMessage) existingMessage.remove();

    if (document.getElementById('status')) {
        checkExtensions();
    } else {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addVerificationCheck);
        } else {
            addVerificationCheck();
        }
    }
})();
