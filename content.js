console.log("contents.js is running!");

function extractJobData() {
    const mainContainer = document.querySelector("[data-hook='card']");
    if (!mainContainer) {
        console.error("Main container not found!");
        return;
    }

    console.log("Main container found:", mainContainer);

    const jobTitle = mainContainer.querySelector("h1")?.textContent.trim() || null;
    console.log("Extracted job title:", jobTitle);

    const companyNameElement = mainContainer.querySelector("a[aria-label] div");
    const companyName = companyNameElement ? companyNameElement.textContent.trim() : null;
    console.log("Extracted company name:", companyName);

    const detailsContainer = Array.from(mainContainer.querySelectorAll("div")).find(div =>
        div.querySelector("strong")
    );

    if (!detailsContainer) {
        console.error("Details container not found!");
        return;
    }

    console.log("Details container found:", detailsContainer);

    const details = {};
    const headings = Array.from(detailsContainer.querySelectorAll("strong"));
    headings.forEach((heading) => {
        const headingText = heading.textContent.trim();
        const detailParagraph = heading.nextElementSibling;
        if (detailParagraph && detailParagraph.tagName === "P") {
            details[headingText] = detailParagraph.textContent.trim();
        }
    });
    console.log("Extracted details:", details);

    const descriptionSections = Array.from(detailsContainer.querySelectorAll("p, ul"))
        .map(el => el.textContent.trim())
        .filter(text => text);
    console.log("Extracted description sections:", descriptionSections);

    const now = new Date();

    const jobData = {
        jobTitle,
        companyName,
        details,
        fullDescription: descriptionSections.join("\n"),
        jobLink: window.location.href,
        dateApplied: now.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }),
    };

    console.log("Final extracted job data:", jobData);

    chrome.runtime.sendMessage({ action: "jobData", data: jobData }, (response) => {
        console.log("Message sent to background.js:", response);
    });
}

const observer = new MutationObserver((mutationsList, observer) => {
    if (document.querySelector("[data-hook='card']")) {
        console.log("Main container detected via MutationObserver!");
        observer.disconnect(); 
        extractJobData();
    }
});

observer.observe(document.body, { childList: true, subtree: true });
