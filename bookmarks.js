/*  Todo ...

    1. Importer: import bookmarks.html into json object.
    2. Finder: find by folder id or find by bookmark id.
    3. Modifier:
        - Remove bookmark,
        - Remove folder with bookmarks inside,
        - Insert bookmark,
        - Insert folder with bookmarks inside

    ROOT
    .
    ├── bookmark 2001
    └── folder 1002
            └── bookmark 2002
*/

var data = [
    {
        "type": "folder",
        "parent_id": null,
        "id": "1001",
        "name": "root",
        "add_date": new Date() / 1000,
        "last_modified": new Date() / 1000,
        "href": null,
        "icon": null,
        "personal_toolbar_folder": true,
        "child_ids": ["2001", "1002"]
    },
    {
        "type": "folder",
        "parent_id": "1001",
        "id": "1002",
        "name": "folder 1002",
        "add_date": new Date() / 1000,
        "last_modified": new Date() / 1000,
        "href": null,
        "icon": null,
        "personal_toolbar_folder": true,
        "child_ids": ["2002", "2003"]
    },
    {
        "type": "bookmark",
        "parent_id": "1001",
        "id": "2001",
        "name": "bookmark 2001",
        "add_date": new Date() / 1000,
        "last_modified": new Date() / 1000,
        "href": "http://www.google.com",
        "icon": " data:image/png;base64,${BASE64_STRING}",
        "personal_toolbar_folder": false,
        "child_ids": []
    },
    {
        "type": "bookmark",
        "parent_id": "1002",
        "id": "2002",
        "name": "bookmark 2002",
        "add_date": new Date() / 1000,
        "last_modified": new Date() / 1000,
        "href": "http://www.google.com",
        "icon": " data:image/png;base64,${BASE64_STRING}",
        "personal_toolbar_folder": false,
        "child_ids": []
    },
    {
        "type": "bookmark",
        "parent_id": "1002",
        "id": "2003",
        "name": "bookmark 2003",
        "add_date": new Date() / 1000,
        "last_modified": new Date() / 1000,
        "href": "http://www.google.com",
        "icon": " data:image/png;base64,${BASE64_STRING}",
        "personal_toolbar_folder": false,
        "child_ids": []
    }
]

var findBookmarkObjById = (id) => {
    let resultObj = null;
    for (let i = 0; i < data.length; i++) {
        let bookmarkObj = data[i];
        if (bookmarkObj.id == id) {
            resultObj = bookmarkObj;
            break;
        }
    };
    return resultObj;
}

function convertToView() {

    console.log("↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦↦");

    let printBookmarkObj = (depth, bookmarkObj) => {
        let text = "";
        for (let i = 0; i < depth; i++) {
            if(i == 0) {
                text += "     ";
            } else {
                text += "  └──";
            }
        }
        if (bookmarkObj.type == "folder") {
            text += " 📁 "
        } else if (bookmarkObj.type == "bookmark") {
            text += " 🔖 ";
        }

        text += `${bookmarkObj.name} (id: ${bookmarkObj.id})`;
        console.log(text);
    }

    let rootFolder = data[0];
    let depth = 0;
    printBookmarkObj(depth, rootFolder);
    let travel = (ids) => {
        //console.log(">> travel: ", ids);
        depth += 1;
        for (let i = 0; i < ids.length; i++) {
            let id = ids[i];
            let result = findBookmarkObjById(id);
            if (result != null) {
                printBookmarkObj(depth, result);
                travel(result.child_ids);
            }
        }
        depth -= 1;
        return;
    }

    travel(rootFolder.child_ids);

    console.log("Total:", data.length);
}

var moveToFolder = (sourceId, targetFolderId, toIndex) => {
    sourceId = sourceId.toString();
    targetFolderId = targetFolderId.toString();
    let targetFolder = findBookmarkObjById(targetFolderId);
    if (targetFolder.type != "folder") {
        console.error("Target is not a folder");
        return;
    }

    let bookmarkObj = findBookmarkObjById(sourceId);
    let parentFolder = findBookmarkObjById(bookmarkObj.parent_id);
    if (parentFolder != null) {
        parentFolder.child_ids = parentFolder.child_ids.filter(function (el) { return el != bookmarkObj.id; });
    }

    bookmarkObj.parent_id = targetFolder.id;
    if (targetFolder.child_ids.length < toIndex) {
        toIndex = 0;
    }
    targetFolder.child_ids.splice(toIndex, 0, bookmarkObj.id);

    convertToView();
}

var insertToFolder = (type, targetFolderId, toIndex) => {
    targetFolderId = targetFolderId.toString();
    let timestamp = new Date().getTime();
    let bookmarkObj = {
        "type": type,
        "parent_id": null,
        "id": timestamp.toString(),
        "name": "bookmark 2002",
        "add_date": timestamp / 1000,
        "last_modified": timestamp / 1000,
        "href": "http://www.google.com",
        "icon": " data:image/png;base64,${BASE64_STRING}",
        "personal_toolbar_folder": false,
        "child_ids": []
    };

    data.push(bookmarkObj);
    moveToFolder(bookmarkObj.id, targetFolderId, toIndex);
}

var removeById = (id) => {
    id = id.toString();
    let bookmarkObj = findBookmarkObjById(id);
    if (bookmarkObj.type == "bookmark") {
        let parentFolder = findBookmarkObjById(bookmarkObj.parent_id);
        if (parentFolder != null) {
            parentFolder.child_ids = parentFolder.child_ids.filter(function (el) { return el != bookmarkObj.id; });
        }
        data = data.filter(function (el) { return el.id != bookmarkObj.id; });

    } else if (bookmarkObj.type == "folder") {
        for (let i = 0; i < bookmarkObj.child_ids.length; i++) {
            let bookmarkId = bookmarkObj.child_ids[i];
            data = data.filter(function (el) { return el.id != bookmarkId; });
        }
        bookmarkObj.child_ids = [];
        data = data.filter(function (el) { return el.id != bookmarkObj.id; });
    }
    convertToView();
}

for (let i = 0; i < 200; i++) {
    let text = "";
    for (let j = 0; j < i; j++) {
        text += " ";
    }
    console.log(text);
}
convertToView();