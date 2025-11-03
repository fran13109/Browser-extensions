# HistoryFinder Chrome Extension



##### Overview



HistoryFinder lets you search, filter, and manage your browsing history using natural language(like old Google history).

You can query your history for the at least 30 days ago and delete individual items directly from the popup.

Features include:



Search using plain English queries ("I watched a video yesterday", "My Github repo last week").

Automatic keyword extraction and timeframe recognition.

Results scoring to show the most relevant history items first.

Delete individual history entries with a 🗑️ button.

Info popup for user guidance.



##### Installation



(keep in mind, not every browser supports extensions)

1. Clone or download the repository.
2. Open your browser and search for extensions
   \[mostly with a puzzle icon top-right]
3. Enable Developer mode (top right)
<img width="460" height="532" alt="image" src="https://github.com/user-attachments/assets/73dfe500-c34d-40c9-a368-ce3808dd0660" />


5. Click Load unpacked → select the folder containing the extension files (manifest.json, popup.html, popup.js, popup.css, background.js)
6. The extension icon will appear in the toolbar.



##### File Structure



HistoryFinder/

│

├─ manifest.json          

├─ background.js          

├─ src/

│  ├─ view/

│  │  ├─ popup.html      

│  │  ├─ popup.css       

│  │  └─ popup.js

├─  ├─controller/

│   │  └─ searchController.js

│   ├─ model/

│   │  ├─ historyManager.js

│   │  ├─ indexer.js

│   │  └─ storageManager.js

│   ├─ utils/

│   │  ├─ queryParser.js

│   │  ├─ scorer.js

│   │  └─ timeExtractor.js



##### &nbsp;      

##### Usage



1. Click the HistoryFinder icon in Chrome.
2. Enter your query in natural language.
   -Examples:
   ⦁	"I saw some headphones yesterday"
   ⦁	"My GitHub repo from last week"
   ⦁	"Youtube video about Linux"
3. Click Search (or press Enter)
4. Results appear, showing:
5. Click 🗑️ to delete a specific history item.
6. Hover or click the i button in the header to see instructions.





##### Permissions



As this extension poitns to be fully private and local of each user, the permissions used are:

* "history" → For reading and delete Chrome browsing history
* "storage" → Optional, for future saving of settings



##### Development Notes



popup.js is modular:

parseQuery() → separates keywords and timeframe

scoreResults() → calculates relevance score

renderResults() → dynamically builds result list

performSearch() → main search function connecting all parts

CSS ensures clean UI:

.hidden class toggles visibility

.result-item:hover provides hover feedback

.spinner animates during search if needed

Info popup positioning is absolute below the info button



##### Future Improvements



* Allow customizable timeframes beyond 30 days
* Add bulk delete for multiple items
* Save search history within the extension for offline queries
* Dark/light theme toggle
* Amplification of match precisions.

  
##### UI visualization

<img width="576" height="546" alt="Screenshot 2025-11-03 000602" src="https://github.com/user-attachments/assets/5c70182c-82d9-42ef-8b95-a35517641011" />






