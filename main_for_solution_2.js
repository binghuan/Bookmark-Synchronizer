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

var book = (function (bookmarkData) {

    // The original JSON object of the bookmark
    let dataTree = bookmarkData || {};

    // Data mapping for each node in bookmarks
    let dataMap = {};

    let temp = null;

    let uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    let getTemp = () => {
        return temp;
    }

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

    let convertToView = () => {
        dataMap = {};
        console.log("↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦");
        let firstFolder = dataTree.roots.bookmark_bar;
        let depth = 0;

        let travel = (folderObj) => {
            //console.log(">> travel: ", folderObj);
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

    let cloneById = (sourceId) => {
        console.log(">> cloneById", sourceId);
        let sourceObj = dataMap[sourceId];
        temp = sourceObj;
    }

    // Move bookmark or folder into another folder
    let moveToFolder = (sourceId, targetFolderId, toIndex) => {
        sourceId = sourceId.toString();
        targetFolderId = targetFolderId.toString();
        let targetFolder = dataMap[targetFolderId];
        // console.log(targetFolder);
        if (targetFolder.type != "folder") {
            console.error("Target is not a folder");
            return;
        }

        let bookmarkObj = dataMap[sourceId];
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

    let cut = (sourceId) => {
        console.log(">> cut:", sourceId);
        let sourceObj = dataMap[sourceId];
        temp = sourceObj;
        removeById(sourceId);
    }

    let copy = (sourceId) => {
        // How to test 
        /*
            book.copy(1); book.getTemp().children[0].name = "hello world"; (book.getTemp().children[0].name == book.getTree().roots.bookmark_bar.children[0].name);
        */
        let copyBookmarkOrFolder = (source) => {
            console.log(">> copyBookmarkOrFolder:");

            if (source == null) {
                return null;
            }

            let theCopy = {
                "children": [],
                "date_added": source.date_added,
                "date_modified": source.date_modified,
                "guid": source.guid,
                "id": source.id,
                "name": source.name,
                "type": source.type
            }
            if (source.meta_info != null) {
                theCopy.meta_info = {
                    last_visited_desktop: source.meta_info.last_visited_desktop,
                    last_visited: source.meta_info.last_visited
                }
            }
            if (source.children != null && source.children.length > 0) {

                let i = 0;
                source.children.forEach((childObj) => {
                    i += 1;
                    console.log("clone child", `${i}/${source.children.length}`);
                    let clone = copyBookmarkOrFolder(childObj);
                    if (clone != null) {
                        theCopy.children.push(clone);
                    }
                })
            }

            console.log("return theCopy:", theCopy)
            return theCopy;
        }

        if (typeof sourceId != "string") {
            sourceId = sourceId.toString();
        }

        let sourceObj = dataMap[sourceId];
        console.log(">> copy:", sourceId, sourceObj);

        //1st, clone 1st layer
        let cloneObj = copyBookmarkOrFolder(sourceObj)
        temp = cloneObj;
    }

    let removeById = (id) => {
        id = id.toString();
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

    let remoteParent = () => {
        for (let i = 0; i < Object.keys(dataMap).length; i++) {
            let key = Object.keys(dataMap)[i];
            delete dataMap[key].parent;
        }
    }

    let toContentString = () => {
        remoteParent();
        let contentString = escapeJsonString(JSON.stringify(dataTree));
        convertToView();
        return contentString;
    }

    return {
        toContentString: toContentString,
        copy: copy,
        cut: cut,
        getTemp: getTemp,
        cut: cut,
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
        },
        convertToView: convertToView,
        printBookmarkObj: printBookmarkObj,
        moveToFolder: moveToFolder,
        insertToFolder: (sourceObj, targetFolderId, toIndex) => {

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
            }

            dataMap[bookmarkObj.id] = bookmarkObj;

            moveToFolder(bookmarkObj.id, targetFolderId, toIndex);
        },
        removeById: removeById

    }
})(bookmarkJson);