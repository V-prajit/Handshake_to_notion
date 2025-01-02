document.getElementById("fetch-job-data").addEventListener("click", () => {
    const statusElement = document.getElementById("status");
    statusElement.textContent = "Fetching job data...";

    chrome.runtime.sendMessage({ action: "getJobData" }, (response) => {
        console.log("Response received in popup.js:", response);

        if (response && response.data) {
            const jobData = response.data;

            console.log("Job data retrieved:", jobData);

            chrome.runtime.sendMessage(
                {
                    action: "sendToNotion",
                    data: jobData,
                },
                (response) => {
                    console.log("Response from sendToNotion:", response);

                    if (response && response.success) {
                        statusElement.textContent = "Job sent to Notion successfully!";
                        console.log("Notion API Response:", response.data);
                    } else {
                        const errorMessage = response?.error || "Unknown error occurred.";
                        statusElement.textContent = `Failed to send job data. Error: ${errorMessage}`;
                        console.error("Error sending to Notion:", errorMessage);
                    }
                }
            );
        } else {
            statusElement.textContent = "No job data found. Please try again.";
            console.error("No job data available in background.js or response is invalid.");
        }
    });
});
