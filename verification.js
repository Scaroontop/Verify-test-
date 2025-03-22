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

// Utility function to format date in YYYY-MM-DD HH:MM:SS format
function formatDate(date) {
    return date.toISOString().replace('T', ' ').split('.')[0];
}

function saveUserData(verificationStatus) {
    const userData = {
        username: "Scaroontop", // Current user's login
        verificationDate: formatDate(new Date()),
        status: verificationStatus,
        lastChecked: formatDate(new Date())
    };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

function checkExtensions() {
    const statusElement = document.getElementById('status');
    const spinner = document.getElementById('spinner');
    const success = document.getElementById('success');
    const failure = document.getElementById('failure');
    const alreadyVerified = document.getElementById('already-verified');

    // Check if already verified and not expired
    const verificationExpiry = localStorage.getItem(VERIFICATION_EXPIRY_KEY);
    const isVerified = localStorage.getItem(STORAGE_KEY) === "verified";
    const now = new Date().getTime();

    if (isVerified && verificationExpiry && parseInt(verificationExpiry) > now) {
        statusElement.textContent = "";
        spinner.classList.add('hidden');
        alreadyVerified.classList.remove('hidden');
        saveUserData("already-verified");
        setTimeout(() => redirectToPage(), 3000);
        return;
    }

    // Clear expired verification
    if (verificationExpiry && parseInt(verificationExpiry) <= now) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(VERIFICATION_EXPIRY_KEY);
        saveUserData("expired");
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
            // Set verification status and expiry (24 hours from now)
            const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem(STORAGE_KEY, "verified");
            localStorage.setItem(VERIFICATION_EXPIRY_KEY, expiryTime.toString());
            saveUserData("verified");
            
            success.classList.remove('hidden');
            statusElement.textContent = `Successfully verified: Redirecting...`;
            setTimeout(() => redirectToPage(), 3000);
        } else {
            failure.classList.remove('hidden');
            statusElement.textContent = "Failed to verify.";
            saveUserData("failed");
        }
    });
}

function redirectToPage() {
    // Get the return URL from the query parameter if it exists
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('returnUrl');
    
    // Redirect to the return URL if provided, otherwise use default
    window.location.href = returnUrl || "https://your-redirect-url.com";
}

// Create verification check function for other pages
function addVerificationCheck() {
    // Only run on non-verification pages
    if (window.location.pathname !== VERIFICATION_PAGE) {
        const verificationExpiry = localStorage.getItem(VERIFICATION_EXPIRY_KEY);
        const isVerified = localStorage.getItem(STORAGE_KEY) === "verified";
        const now = new Date().getTime();

        if (!isVerified || !verificationExpiry || parseInt(verificationExpiry) <= now) {
            // Create warning message with improved styling
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                background-color: #fee2e2;
                color: #991b1b;
                padding: 1rem;
                text-align: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                z-index: 9999;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                animation: slideDown 0.3s ease-out;
            `;
            
            // Add animation keyframes
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideDown {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
            
            messageDiv.textContent = "You did not pass the test. Please verify to access.";
            document.body.prepend(messageDiv);

            // Store current page URL for return after verification
            const currentPage = window.location.href;
            saveUserData("redirect-to-verification");
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = `${VERIFICATION_PAGE}?returnUrl=${encodeURIComponent(currentPage)}`;
            }, 2000);
        } else {
            // Update last checked time for verified users
            const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || "{}");
            userData.lastChecked = formatDate(new Date());
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        }
    }
}

// Initialize verification or check based on page
(function() {
    if (document.getElementById('status')) {
        // We're on the verification page
        checkExtensions();
    } else {
        // We're on another page that needs verification
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', addVerificationCheck);
        } else {
            addVerificationCheck();
        }
    }
})();

// Debug function to get verification status (can be removed in production)
function getVerificationStatus() {
    const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY) || "{}");
    const verificationExpiry = localStorage.getItem(VERIFICATION_EXPIRY_KEY);
    const isVerified = localStorage.getItem(STORAGE_KEY) === "verified";
    
    return {
        isVerified,
        expiryTime: verificationExpiry ? new Date(parseInt(verificationExpiry)).toISOString() : null,
        userData
    };
}
