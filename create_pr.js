// Main loop function to repeatedly process tasks
function mainLoop() {
    // Get all task links and collect their hrefs
    const taskHrefs = Array.from(document.querySelectorAll('a[href^="/codex/tasks/task_"]'))
        .map(link => link.getAttribute('href'));

    if (taskHrefs.length === 0) {
        console.log('No tasks to process, waiting 60 seconds before checking again');
        setTimeout(mainLoop, 60000); // Wait 60 seconds and restart the loop
        return;
    }

    // Function to process a single task by its href
    function processTask(href, index) {
        // Find the link by its href
        const link = document.querySelector(`a[href="${href}"]`);
        if (!link) {
            console.error(`Task link with href ${href} not found`);
            // Proceed to next if available
            if (index < taskHrefs.length - 1) {
                setTimeout(() => processTask(taskHrefs[index + 1], index + 1), 1000);
            } else {
                console.log('All tasks processed, waiting 60 seconds before next cycle');
                setTimeout(mainLoop, 60000); // Wait 60 seconds and restart the loop
            }
            return;
        }

        link.click(); // Click the task link

        setTimeout(() => {
            // Find "Create PR" span
            const createPRSpans = Array.from(document.querySelectorAll('span.truncate'))
                .filter(span => span.textContent.trim() === 'Create PR');
            
            // Find "View PR" span
            const viewPRSpans = Array.from(document.querySelectorAll('span.truncate'))
                .filter(span => span.textContent.trim() === 'View PR');
            
            let clickOverlay = false;
            if (createPRSpans.length > 0) {
                const createPRButton = createPRSpans[0].closest('button');
                if (createPRButton) {
                    createPRButton.click(); // Click "Create PR" if found
                    clickOverlay = true;
                } else {
                    console.error('Create PR button not found');
                }
            } else if (viewPRSpans.length > 0) {
                console.log('View PR button found, will click overlay after going back');
                clickOverlay = true;
            } else {
                console.error('Neither Create PR nor View PR found, going back without clicking overlay');
            }

            // Wait 1s after PR action (or skip), then proceed
            setTimeout(() => proceedAfterAction(href, index, clickOverlay), 1000);
        }, 4000); // Wait after clicking the task
    }

    // Helper function to handle going back, optionally clicking overlay, and proceeding to next
    function proceedAfterAction(href, index, clickOverlay) {
        // Find and click "Go back to tasks" button
        const backButton = document.querySelector('button[aria-label="Go back to tasks"]');
        if (backButton) {
            backButton.click(); // Click "Go back"
            
            setTimeout(() => {
                // After going back, if clickOverlay is true, find the link again by href and click its overlay button
                if (clickOverlay) {
                    const updatedLink = document.querySelector(`a[href="${href}"]`);
                    if (updatedLink) {
                        const overlayButton = updatedLink.querySelector('div[role="button"]');
                        if (overlayButton) {
                            overlayButton.click(); // Click the overlay button
                            
                            // Wait 1 second, then process the next task if any
                            if (index < taskHrefs.length - 1) {
                                setTimeout(() => processTask(taskHrefs[index + 1], index + 1), 1000);
                            } else {
                                console.log('All tasks processed, waiting 60 seconds before next cycle');
                                setTimeout(mainLoop, 60000); // Wait 60 seconds and restart the loop
                            }
                        } else {
                            console.error('Overlay button not found for ' + href);
                            // Proceed to next
                            if (index < taskHrefs.length - 1) {
                                setTimeout(() => processTask(taskHrefs[index + 1], index + 1), 1000);
                            } else {
                                console.log('All tasks processed, waiting 60 seconds before next cycle');
                                setTimeout(mainLoop, 60000); // Wait 60 seconds and restart the loop
                            }
                        }
                    } else {
                        console.error(`Updated task link with href ${href} not found after going back`);
                        // Proceed to next
                        if (index < taskHrefs.length - 1) {
                            setTimeout(() => processTask(taskHrefs[index + 1], index + 1), 1000);
                        } else {
                            console.log('All tasks processed, waiting 60 seconds before next cycle');
                            setTimeout(mainLoop, 60000); // Wait 60 seconds and restart the loop
                        }
                    }
                } else {
                    // If clickOverlay is false, skip overlay and proceed to next task
                    if (index < taskHrefs.length - 1) {
                        setTimeout(() => processTask(taskHrefs[index + 1], index + 1), 1000);
                    } else {
                        console.log('All tasks processed, waiting 60 seconds before next cycle');
                        setTimeout(mainLoop, 60000); // Wait 60 seconds and restart the loop
                    }
                }
            }, 1000);
        } else {
            console.error('Go back to tasks button not found');
            // Proceed to next
            if (index < taskHrefs.length - 1) {
                setTimeout(() => processTask(taskHrefs[index + 1], index + 1), 1000);
            } else {
                console.log('All tasks processed, waiting 60 seconds before next cycle');
                setTimeout(mainLoop, 60000); // Wait 60 seconds and restart the loop
            }
        }
    }

    // Start processing from the first task in this cycle
    processTask(taskHrefs[0], 0);
}

// Start the infinite loop
mainLoop();
