-- Handler to replace text
on replaceText(findText, replaceText, subjectText)
    set prevTIDs to AppleScript's text item delimiters
    set AppleScript's text item delimiters to findText
    set subjectText to text items of subjectText
    set AppleScript's text item delimiters to replaceText
    set subjectText to subjectText as text
    set AppleScript's text item delimiters to prevTIDs
    return subjectText
end replaceText

-- Find all problem*.txt files using shell (outside tell block)
set problemFiles to paragraphs of (do shell script "find . -type f -name 'problem*.txt'")

-- Process each file
repeat with problemPath in problemFiles
    -- Compute dir, basedir, fileName, suffix, goPath
    set dir to do shell script "dirname " & quoted form of problemPath
    set basedir to do shell script "basename " & quoted form of dir
    set fileName to do shell script "basename " & quoted form of problemPath
    set suffix to my replaceText("problem", "", fileName)
    set suffix to my replaceText(".txt", "", suffix)
    set goPath to dir & "/" & basedir & suffix & ".go"
    
    -- Check if go file exists
    set fileExists to (do shell script "[ -f " & quoted form of goPath & " ] && echo 'yes' || echo 'no'") = "yes"
    
    if not fileExists then
        -- Set prompt text
        set promptText to "write a go solution to " & problemPath & " and save it to " & goPath
        
        -- Interact with Safari
        tell application "Safari"
            activate  -- Bring Safari to the front
            tell document 1  -- Targets the active tab
                -- Step 1: Focus the contenteditable div
                do JavaScript "document.getElementById('prompt-textarea').focus();"
                
                -- Step 2: Fill the text (wrap in <p> for ProseMirror)
                do JavaScript "document.getElementById('prompt-textarea').innerHTML = '<p>' + " & quoted form of promptText & " + '</p>';"
                
                -- Step 3: Click the button
                do JavaScript "document.querySelector('button.btn.relative.btn-primary').click();"
            end tell
        end tell
        
        -- Wait for response (adjust delay in seconds based on average response time; e.g., 60 for 1 minute)
        delay 70
        
        -- Optional: Clear the input if not auto-cleared (would need another tell block)
        -- tell application "Safari"
        --     tell document 1
        --         do JavaScript "document.getElementById('prompt-textarea').innerHTML = '<p data-placeholder=\"Describe a task\" class=\"placeholder\"><br class=\"ProseMirror-trailingBreak\"></p>';"
        --     end tell
        -- end tell
    end if
end repeat
