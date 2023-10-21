import {runFormatCheck} from "./format-check";
import {BaseGitApiService} from "./services/base-git-api-service";
import {getSettings} from "./types/settings";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    // Retrieve the settings for the format check task.
    // If the settings indicate that it's not a PR request build, the program will exit.
    const settings = getSettings();

    await BaseGitApiService.init(settings);

    const shouldFail = await runFormatCheck(settings);

    // Exit the program based on the format check outcome
    if (shouldFail) {
        console.log("Format check task failed.");
        process.exit(1);
    } else {
        console.log("Format check task succeeded.");
        process.exit(0);
    }
}

// Call these functions in your main function and do your own error handling
main().catch(error => {
    console.error(error);
    process.exit(1);
});