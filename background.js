import { CONFIG } from "./config.js";
const { NOTION_API_URL: notionApiUrl, NOTION_DATABASE_ID: databaseId, NOTION_API_KEY: apiKey } = CONFIG;

let cachedJobData = null; 

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    if (message.action === "jobData") {
      console.log("Received job data in background.js:", message.data);
      cachedJobData = message.data;
      console.log("Job data received from content script:", cachedJobData);
      sendResponse({ success: true });
    }

    if (message.action === "getJobData") {
      if (cachedJobData) {
        sendResponse({ data: cachedJobData });
      } else {
        sendResponse({ data: null });
      }
    }

    if (message.action === "sendToNotion") {

      if (!message.data) {
        sendResponse({ success: false, error: "No job data provided." });
        return;
      }

      const jobData = message.data;

      const requestBody = {
        parent: { database_id: databaseId },
        properties: {
          "Job Title": {
            rich_text: [
              {
                text: { content: jobData.jobTitle || "No Title Provided" },
              },
            ],
          },
          "Company Name": {
            title: [
              {
                text: { content: jobData.companyName || "No Company Provided" },
              },
            ],
          },
          "Job Description": {
            rich_text: [
              {
                text: { content: jobData.fullDescription || "No Description Provided" },
              },
            ],
          },
          "Job URL": {
            url: jobData.jobLink || "",
          },
          "Date Applied": {
            date: {
              start: new Date(jobData.dateApplied).toISOString(),
            },
          },
        },
      };
      
      const response = await fetch(notionApiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log("Data sent to Notion successfully:", responseData);
        sendResponse({ success: true, data: responseData });
      } else {
        console.error("Error sending data to Notion:", responseData);
        sendResponse({ success: false, error: responseData });
      }
    }
  } catch (error) {
    console.error("Error in background.js:", error);
    sendResponse({ success: false, error: error.message });
  }

  return true; 
});
