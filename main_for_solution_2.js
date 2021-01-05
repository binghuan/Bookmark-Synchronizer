let bookmarkTree = {
    "checksum": "695bd7d6ad4e4c5cdc6dd999b96c3046",
    "roots": {
        "bookmark_bar": {
            "children": [
                {
                    "date_added": "13019420134102000",
                    "guid": "7dfde927-cc03-f5c6-bee8-8bc3cdf8cd57",
                    "id": "5006",
                    "meta_info": {
                        "last_visited_desktop": "13204094342410328",
                        "last_visited": "13204094342410328"
                    },
                    "name": "Feedly",
                    "type": "url",
                    "url": "http://cloud.feedly.com/#latest"
                }
            ],
            "date_added": "13023623358198834",
            "date_modified": "13253167117802281",
            "guid": "00000000-0000-4000-a000-000000000002",
            "id": "1",
            "name": "Bookmarks Bar",
            "type": "folder"
        }
    },
    "sync_metadata": "CrABCo8BCI",
    "version": 1
};

let printBookmarkObj = (depth, bookmarkObj) => {
    if (bookmarkObj == null) {
        return;
    }
    let text = "";
    for (let i = 0; i < depth; i++) {
        if (i == 0) {
            text += "     ";
        } else {
            text += "  └──";
        }
    }
    if (bookmarkObj.type == "folder") {
        text += " 📁 "
    } else if (bookmarkObj.type == "url") {
        text += " 🔖 ";
    }

    text += `${bookmarkObj.name} (id: ${bookmarkObj.id})`;
    console.log(text);
}

let bookmarkMap = {};

function convertToView() {
    bookmarkMap = {};
    console.log("↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦");
    let firstFolder = bookmarkTree.roots.bookmark_bar;
    let depth = 0;

    let travel = (folderObj) => {
        //console.log(">> travel: ", folderObj);
        if (folderObj == null) {
            return;
        }

        bookmarkMap[folderObj.id] = folderObj;
        if (folderObj.children == null) {
            return;
        }

        depth += 1;
        for (let i = 0; i < folderObj.children.length; i++) {
            let bookmarkObj = folderObj.children[i];
            if (bookmarkObj != null) {
                bookmarkObj.parent = folderObj;
                bookmarkMap[bookmarkObj.id] = bookmarkObj;
                printBookmarkObj(depth, bookmarkObj);
                travel(bookmarkObj);
            }
        }
        depth -= 1;
        return;
    }

    printBookmarkObj(depth, firstFolder);
    if (firstFolder != null) {
        travel(firstFolder);
    }
    console.log("Total:", Object.keys(bookmarkMap).length);
}


var moveToFolder = (sourceId, targetFolderId, toIndex) => {
    sourceId = sourceId.toString();
    targetFolderId = targetFolderId.toString();
    let targetFolder = bookmarkMap[targetFolderId];
    console.log(targetFolder);
    if (targetFolder.type != "folder") {
        console.error("Target is not a folder");
        return;
    }

    let bookmarkObj = bookmarkMap[sourceId];
    if (targetFolder.children.length < toIndex) {
        toIndex = 0;
    }
    targetFolder.children.splice(toIndex, 0, bookmarkObj);

    convertToView();
}

let insertToFolder = (type, targetFolderId, toIndex) => {
    targetFolderId = targetFolderId.toString();
    let timestamp = new Date().getTime() * 10000;
    let bookmarkObj = {
        "date_added": timestamp,
        "guid": null,
        "id": timestamp,
        "meta_info": {
            "last_visited_desktop": null,
            "last_visited": null,
        },
        "name": (type == "folder") ? "folder" : "bookmark",
        "type": (type == "folder") ? "folder" : "url",
        "url": "http://www.google.com",
    };

    if (type == "folder") {
        bookmarkObj.children = [];
    }

    bookmarkMap[bookmarkObj.id] = bookmarkObj;

    moveToFolder(bookmarkObj.id, targetFolderId, toIndex);
}

let removeById = (id) => {
    id = id.toString();
    let bookmarkObj = bookmarkMap[id];
    if (bookmarkObj == null) {
        return;
    }
    bookmarkObj.parent.children = bookmarkObj.parent.children.filter(function (el) { return el.id != bookmarkObj.id; });
    convertToView();
}

convertToView();