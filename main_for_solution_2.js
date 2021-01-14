// Reference: MDN Object.assign()
// https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Object/assign

/*
JSON.stringify(book.getTree()); 
VM233:1 Uncaught TypeError: Converting circular structure to JSON
    --> starting at object with constructor 'Object'
    |     property 'children' -> object with constructor 'Array'
    |     index 0 -> object with constructor 'Object'
    --- property 'parent' closes the circle
    at JSON.stringify (<anonymous>)
    at <anonymous>:1:6

--> Solution: remove parent before JSON.stringify()
*/
var bookmarkJson = {
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
                    "url": "http://www.feedly.com",
                },
                {
                    "date_added": "13019420134102000",
                    "guid": "7dfde927-cc03-f5c6-bee8-8bc3cdf8cd57",
                    "id": "6001",
                    "meta_info": {
                        "last_visited_desktop": "13204094342410328",
                        "last_visited": "13204094342410328"
                    },
                    "name": "My Folder",
                    "type": "folder",
                    "children": [
                        {
                            "date_added": "13019420134102000",
                            "guid": "7dfde927-cc03-f5c6-bee8-8bc3cdf8cd57",
                            "id": "7002",
                            "meta_info": {
                                "last_visited_desktop": "13204094342410328",
                                "last_visited": "13204094342410328"
                            },
                            "name": "Google",
                            "type": "url",
                            "url": "http://www.google.com"
                        }
                    ]
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

var bkmg = (function (bookmarkData) {

    // The original JSON object of the bookmark
    let dataTree = bookmarkData || {};

    // Data mapping for each node in bookmarks
    let dataMap = {};

    let objInClipboard = null;

    let uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }



    let printBookmarkObj = (depth, bookmarkObj) => {
        if (bookmarkObj == null) {
            return;
        }
        let text = "";
        for (let i = 0; i < depth; i++) {
            if (i == depth - 1) {
                text += "  └──";
            } else {
                text += "     ";
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
    // Iterate the bookmark data and build the map for using.
    let convertToView = () => {
        dataMap = {};
        console.log("↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦");
        let firstFolder = dataTree.roots.bookmark_bar;
        let depth = 0;

        let traverse = (folderObj) => {
            if (folderObj == null) {
                return;
            }

            dataMap[folderObj.id] = folderObj;
            if (folderObj.children == null) {
                return;
            }

            depth += 1;
            for (let i = 0; i < folderObj.children.length; i++) {
                let bookmarkObj = folderObj.children[i];
                if (bookmarkObj != null) {
                    bookmarkObj.parent = folderObj;
                    dataMap[bookmarkObj.id] = bookmarkObj;
                    printBookmarkObj(depth, bookmarkObj);
                    traverse(bookmarkObj);
                }
            }
            depth -= 1;
            return;
        }

        printBookmarkObj(depth, firstFolder);
        if (firstFolder != null) {
            traverse(firstFolder);
        }

        let total = 0;
        for (let i = 0; i < Object.keys(dataMap).length; i++) {
            let key = Object.keys(dataMap)[i];
            let bkObj = dataMap[key];
            if (bkObj.type == "url") {
                total += 1;
            }
        }

        console.log("Total:", total);
    };

    // Move bookmark or folder into another folder
    let move = (sourceId, targetFolderId, toIndex) => {
        sourceId = sourceId.toString();
        targetFolderId = targetFolderId.toString();
        let targetFolder = dataMap[targetFolderId];
        if (targetFolder.type != "folder") {
            console.error("Target is not a folder");
            return;
        }

        let bookmarkObj = dataMap[sourceId];
        if (bookmarkObj == null) {
            console.error(`BookmarkObj (ID: ${sourceId}) was not found!`);
            return;
        }
        if (targetFolder.children.length < toIndex) {
            toIndex = 0;
        }

        if (bookmarkObj.parent != null) {
            bookmarkObj.parent.children = bookmarkObj.parent.children.filter(function (el) { return el.id != bookmarkObj.id; });
        }

        bookmarkObj.parent = targetFolder;
        targetFolder.children.splice(toIndex, 0, bookmarkObj);

        convertToView();
    }

    convertToView();

    // Clone bookmark or folder into memory and remove original bookmark or folder.
    let cut = (sourceId) => {
        console.log(">> cut:", sourceId);
        if (typeof sourceId != "string") {
            sourceId = sourceId.toString();
        }
        let sourceObj = dataMap[sourceId];
        setCopy(sourceObj);
        convertToView();
        remove(sourceId);
    }

    let removeParentRecursively = (dataObj) => {
        if (dataObj == null) {
            return;
        }
        delete dataObj.parent;
        if (dataObj.children != null) {
            dataObj.children.forEach(item => {
                removeParentRecursively(item);
            })
        }
        return;
    }

    // Return saved bookmark or folder from memory.
    let getCopy = () => {
        return objInClipboard;
    }

    let setCopy = (dataObj) => {
        if (dataObj == null) {
            objInClipboard = null;
            return;
        }
        removeParentRecursively(dataObj);
        let cloneObj = JSON.parse(JSON.stringify(dataObj));
        objInClipboard = cloneObj;
    }

    // Clone bookmark or folder into memory.
    let copy = (sourceId) => {
        if (sourceId == null) {
            console.warn("Need to input an ID for bookmark or folder.");
        }
        if (typeof sourceId != "string") {
            sourceId = sourceId.toString();
        }

        removeParent();
        let sourceObj = dataMap[sourceId];
        setCopy(sourceObj);
        convertToView();
    }

    // Remove bookmark or folder.
    let remove = (id) => {
        id = id.toString();
        console.log(`>> remove(${id})`);
        let bookmarkObj = dataMap[id];
        if (bookmarkObj == null) {
            return;
        }
        bookmarkObj.parent.children = bookmarkObj.parent.children.filter(function (el) { return el.id != bookmarkObj.id; });
        convertToView();
    }

    let escapeJsonString = (str) => {
        return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
    }

    let removeParent = () => {
        for (let i = 0; i < Object.keys(dataMap).length; i++) {
            let key = Object.keys(dataMap)[i];
            delete dataMap[key].parent;
        }
    }

    // Escape JSON string and return it.
    let toContentString = () => {
        removeParent();
        let contentString = escapeJsonString(JSON.stringify(dataTree));
        convertToView();
        return contentString;
    }

    // Parse Bookmarks to JSON String.
    let toJSONSring = () => {
        removeParent();
        let jsonString = JSON.stringify(dataTree);
        convertToView();
        return jsonString;
    }

    // Insert bookmark or folder into a folder.
    let paste = (sourceObj, targetFolderId, toIndex) => {
        console.log(`>> paste: ${sourceObj} to folder ${targetFolderId} toIndex ${toIndex}`);
        if (sourceObj == null) {
            console.warn("sourceObj is null");
            return;
        }

        targetFolderId = targetFolderId.toString();
        let timestamp = new Date().getTime() * 10000;

        let bookmarkObj = null;
        if (typeof sourceObj == "string") {
            let type = sourceObj;
            bookmarkObj = {
                "date_added": timestamp,
                "guid": uuidv4(),
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
        } else {
            let theCopy = JSON.parse(JSON.stringify(sourceObj));
            bookmarkObj = theCopy;
        }

        let idCounter = 10000;
        let now = new Date().getTime();
        let recursiveUpdate = (dataObj) => {
            if (dataObj == null) {
                return;
            }
            let newId = now.toString().concat((idCounter += 1).toString());
            dataObj.guid = uuidv4();
            dataObj.id = newId;
            dataObj.date_added = now * 10000;

            if (dataObj.children != null) {
                dataObj.children.forEach(item => {
                    recursiveUpdate(item);
                })
            }
            return;
        }

        recursiveUpdate(bookmarkObj);
        dataMap[bookmarkObj.id] = bookmarkObj;
        move(bookmarkObj.id, targetFolderId, toIndex);
    };

    let test = () => {
        copy(1);
        getCopy().children[0].name = "hello world";
        if ((bkmg.getCopy().children[0].name ==
            bkmg.getTree().roots.bookmark_bar.children[0].name) == false) {
            console.log("PASS");
        };
        move(7002, 1, 0)
        cut(6001, 1, 0);
        paste("folder", 1, 0);
        paste(bkmg.getCopy(), 1, 0);
        remove(5006);
        copy(1);
        paste(bkmg.getCopy(), 1, 0);
    }

    return {
        test: test,
        toContentString: toContentString,
        toJSONString: toJSONSring,
        copy: copy,
        cut: cut,
        move: move,
        paste: paste,
        remove: remove,
        convertToView: convertToView,
        getCopy: getCopy,
        getTree: () => {
            return dataTree;
        },
        getMap: () => {
            return dataMap;
        },
        setTree: (data) => {
            if (typeof data == "string") {
                dataTree = JSON.parse(data)
            } else {
                dataTree = data;
            }
        }
    }
})(bookmarkJson);