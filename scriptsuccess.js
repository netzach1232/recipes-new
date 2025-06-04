const email = localStorage.getItem("registeredEmail");

if (email) {
    document.getElementById("userEmailSuccess").textContent = email;
    localStorage.removeItem("registeredEmail");
}

function openMail() {
    const email = document.getElementById("userEmailSuccess").textContent.trim();
    if (!email.includes("@")) {
        alert("לא ניתן לזהות את כתובת הדוא\"ל.");
        return;
    }

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
}
