import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://izpbbjhikbbbyahxzhkg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cGJiamhpa2JiYnlhaHh6aGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxOTMxMDUsImV4cCI6MjA2Mzc2OTEwNX0.Gv0WaUlkUAW1qBNEaaXDCWWpwWgbvBTya8KQzFhx08s'; // (המפתח המלא שלך)

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

window.resetPasswordAndOpenMail = async function () {
    const email = document.getElementById("username").value.trim();
    const errorDiv = document.getElementById("error");

    if (!email) {
        errorDiv.textContent = "יש להזין כתובת מייל.";
        errorDiv.style.display = "block";
        return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://netzach1232.github.io/recipes-new/update-password.html'
    });

    if (error) {
        errorDiv.textContent = "אירעה שגיאה: " + error.message;
        errorDiv.style.display = "block";
        return;
    }

    // זיהוי הדומיין של המייל ופתיחה ישירה של אתר הדוא"ל
    const domain = email.split("@")[1].toLowerCase();
    let mailLink = "";

    if (domain.includes("gmail")) {
        mailLink = "https://mail.google.com/";
    } else if (domain.includes("outlook") || domain.includes("hotmail") || domain.includes("live")) {
        mailLink = "https://outlook.live.com/";
    } else if (domain.includes("yahoo")) {
        mailLink = "https://mail.yahoo.com/";
    } else {
        mailLink = "https://" + domain;
    }

    window.open(mailLink, "_blank");
};

async function login() {
    const email = document.getElementById("username").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        const errorBox = document.getElementById("error");
        errorBox.textContent = "יש למלא את כל השדות.";
        errorBox.style.display = "block"; // ← זו השורה שחסרה לך
        return;
    }


    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.log("שגיאה בלוגין:", error.message);
        const errorBox = document.getElementById("error");
        errorBox.textContent = "אימייל או סיסמה שגויים.";
        errorBox.style.display = "block";
        return;
    }


    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    document.cookie = `session=true; expires=${now.toUTCString()}; path=/`;

    window.location.href = "home.html";
}

function openRegister() {
    document.getElementById("registerOverlay").classList.remove("hidden");
}

function closeRegister() {
    document.getElementById("registerOverlay").classList.add("hidden");
}

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function clearErrors() {
    document.getElementById("firstNameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("passwordError").textContent = "";
}

async function register() {
    const fname = document.getElementById("firstName").value.trim();
    const lname = document.getElementById("lastName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    clearErrors();
    let hasError = false;

    if (!fname) {
        document.getElementById("firstNameError").textContent = "יש להזין שם פרטי";
        hasError = true;
    }

    if (!lname) {
        document.getElementById("lastNameError").textContent = "יש להזין שם משפחה";
        hasError = true;
    }

    if (!email) {
        document.getElementById("emailError").textContent = "יש להזין אימייל";
        hasError = true;
    } else if (!isValidEmail(email)) {
        document.getElementById("emailError").textContent = "האימייל לא תקין";
        hasError = true;
    }

    if (!password) {
        document.getElementById("passwordError").textContent = "יש להזין סיסמה";
        hasError = true;
    } else if (password.length < 8) {
        document.getElementById("passwordError").textContent = "הסיסמה חייבת להיות לפחות 8 תווים";
        hasError = true;
    }

    if (password !== confirmPassword) {
        document.getElementById("confirmError").textContent = "הסיסמאות לא תואמות";
        hasError = true;
    }

    if (hasError) return;

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            createSession: false,
            emailRedirectTo: "https://netzach1232.github.io/recipes-new/"
        }
    });

    if (error) {
        document.getElementById("emailError").textContent = "האימייל כבר קיים או שגיאה כללית";
        return;
    }

    localStorage.setItem("registeredEmail", email);

    // 🔴 קריטי – מונע התחברות מיידית לפני אישור אימייל
    await supabase.auth.signOut();

    window.location.href = "success.html";
}

// התנהגות אנטר בדף כניסה והרשמה
window.addEventListener("keydown", function (e) {
    // אם לוחצים אנטר
    if (e.key === "Enter") {
        const registerOverlay = document.getElementById("registerOverlay");
        const isRegisterOpen = !registerOverlay.classList.contains("hidden");

        if (!isRegisterOpen) {
            // במצב כניסה
            e.preventDefault(); // למנוע שליחת טופס דיפולטיבית
            login(); // מפעיל התחברות
        } else {
            // במצב הרשמה
            const focusables = Array.from(registerOverlay.querySelectorAll("input"));
            const current = document.activeElement;
            const currentIndex = focusables.indexOf(current);

            if (currentIndex > -1 && currentIndex < focusables.length - 1) {
                // עובר לשדה הבא
                e.preventDefault();
                focusables[currentIndex + 1].focus();
            } else {
                // בשדה האחרון — מפעיל הרשמה
                e.preventDefault();
                register();
            }
        }
    }
});




window.openRegister = openRegister;
window.closeRegister = closeRegister;
window.login = login;
window.register = register;


