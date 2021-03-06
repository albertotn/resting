 define(['knockout', 'app/bookmark', 'app/storage', 'app/bacheca', 'component/bookmarks/bookmarkVm','component/entry-list/entryItemVm'],function(ko, makeBookmarkProvider, storage, bacheca, BookmarkVm, EntryItemVm) {

  // FIXME app.js duplication
  function ContextVm(name = 'default',variables = []) {
    const self = this;
    this.name = ko.observable(name);
    this.variables = ko.observableArray(variables.map(v => new EntryItemVm(v.name, v.value, v.enabled)));
    this.isDefault = ko.computed(function() {
        return this.name() === 'default';
    }, this);
  };

  return function BookmarksVm(params) {

    const appVm = params.appVm;

    let bookmarkToDelete = null;
    let bookmarkOfContextMenu;
    const bookmarkToDeleteName = ko.observable();
    const tryToDeleteFolder = ko.observable(false);
    const showBookmarkDeleteDialog = ko.observable(false);
    const showFolderDialog = ko.observable(false);
    const showImportDialog = ko.observable(false);
    const showExportDialog = ko.observable(false);
    const folderName = ko.observable();
    const importSrc = ko.observable('har');
    const exportSrc = ko.observable('har');

    // contextual menu
    const showContextMenu = ko.observable(false);
    const contextMenuPosX = ko.observable('0px');
    const contextMenuPosY = ko.observable('0px');

    // FIXME: direct ref to bookmarks in appVm
    const bookmarks = params.bookmarks;
    const contexts = appVm.contexts;

    const deleteChildrenBookmarks = ko.observable();

    const bookmarkProvider = makeBookmarkProvider(storage);

    const confirmDelete = bookmark => {
      bookmarkToDelete = bookmark;
      bookmarkToDeleteName(bookmark.viewName());
      tryToDeleteFolder(bookmark.isFolder);
      showBookmarkDeleteDialog(true);
    };

    const _serializeBookmark = (bookmarkObj) => {
      return bookmarkProvider.fromJson(JSON.stringify(bookmarkObj));
    }

    const expandFolder = (folder) => {
      folder.folderCollapsed(!folder.folderCollapsed());
    };

    const addFolder = () => {
      const folder = bookmarkProvider.makeFolder(storage.generateId(), folderName());
      storage.save(_serializeBookmark(folder));
      bookmarks.push(new BookmarkVm(folder));
      folderName('');
      // close the dialog
      dismissFolderDialog();

      bacheca.publish('addFolder', folder);
    };

    const folderDialog = () => {
      showFolderDialog(true);
    };

    const dismissFolderDialog = () => {
      showFolderDialog(false);
    };

    const addFolderOnEnter = (data,event) => {
      const enter = 13;
      if(event.keyCode === enter) {
        addFolder();
      }
    };

    const _loadBookmarksNewFormat = () =>
      storage.iterate( value => {
        bookmarks.push(new BookmarkVm(value));
        if(value.isFolder) {
          bacheca.publish('addFolder', value);
        }
    });

    const deleteBookmarkFromView = () => {
      deleteBookmark(bookmarkToDelete, deleteChildrenBookmarks());
      if(bookmarkToDelete.isFolder) {
        bacheca.publish('deleteFolder', bookmarkToDelete);
      }

      bookmarkToDelete = null;
      dismissDeleteBookmarkDialog();
    }

    const dismissDeleteBookmarkDialog = () => {
      showBookmarkDeleteDialog(false);
      deleteChildrenBookmarks(false);
    }

    const dismissImportDialog = () => {
      showImportDialog(false);
      document.getElementById("import-file").value = '';
    }

     const dismissExportDialog = () => {
      showExportDialog(false);
    }

    const deleteBookmark = (bookmark, deleteChildrenBookmarks) => {
      if(bookmark.folder) {
        const containerFolder = bookmarks().find( b => b.id === bookmark.folder);
        let modifiedFolder = Object.assign({},containerFolder);
        modifiedFolder.bookmarks = containerFolder.bookmarks.filter(b => b.id !== bookmark.id);
        bookmarkProvider.save(_serializeBookmark(modifiedFolder));
        bookmarks.replace(containerFolder,modifiedFolder);
      } else {
        if(bookmark.isFolder && !deleteChildrenBookmarks) {
          const childrenBookmarks = bookmark.bookmarks.map( child => {
            child.folder=null;
            return child;
          });
          //FIXME: bad use _saveBookmark from appVm
          childrenBookmarks.forEach(child => appVm._saveBookmark(child, true));
        }
        storage.deleteById(bookmark.id, () => bookmarks.remove(bookmark));
      }

      bacheca.publish('deleteBookmark');
       if( bookmark.id == appVm.bookmarkSelected.id()) {

         appVm.bookmarkCopy = null;
         appVm.folderSelected('');

         appVm.bookmarkSelected.id('');
         appVm.bookmarkSelected.name('');
         appVm.clearRequest();
      }
    };

    const importBookmarks = () => {
      _handleImport();
      dismissImportDialog();
    };

    const exportBookmarks = () => {
      _handleExport();
      dismissExportDialog();
    };

    const importDialog = () => {
      showImportDialog(true);
    };

    const exportDialog = () => {
      showExportDialog(true);
    };

    const loadBookmarkObj = (bookmarkObj) => {
       bacheca.publish('loadBookmark', bookmarkObj);
    };

    const contextMenu = (bookmark, event) => {
        const posX = event.clientY;
        const posY = event.clientX;
        bookmarkOfContextMenu = bookmark;
        showContextMenu(true);
        contextMenuPosX(`${posX}px`);
        contextMenuPosY(`${posY}px`);
    };

    const duplicate = () => {
      const duplicate = bookmarkProvider.copyBookmark(bookmarkOfContextMenu);
      duplicate.created = new Date();
      if(duplicate.name) {
        duplicate.name = 'Copy_' + duplicate.name;
      }
      duplicate.id = storage.generateId();
      if(duplicate.folder) {
        let folderObj = bookmarks().find(b => b.id === duplicate.folder);
        const modifiedFolder = bookmarkProvider.addBookmarks(folderObj, new BookmarkVm(duplicate));
        bookmarkProvider.save(_serializeBookmark(modifiedFolder));
        bookmarks.replace(folderObj, modifiedFolder);
      } else {
        bookmarkProvider.save(_serializeBookmark(duplicate));
        bookmarks.push(new BookmarkVm(duplicate));
      }
    };

    const _handleImport = () => {
        const f = document.getElementById("import-file").files;
        const fr = new FileReader();
        fr.onload = (e) => {
          const content = e.target.result;
          const importedBookmarks = bookmarkProvider.importHAR(content);
          importedBookmarks.bookmarks.forEach(
            b => {
              bookmarkProvider.save(b);
              const bookmarkToEdit = bookmarks().find(bookmark => bookmark.id === b.id);
              const bookmarkVm = new BookmarkVm(b);
              if(bookmarkToEdit) {
                bookmarks.replace(bookmarkToEdit, bookmarkVm);
              } else {
                bookmarks.push(bookmarkVm);
              }
              if(b.isFolder) {
                bacheca.publish('addFolder', b);
              }
            });

            importedBookmarks.contexts.forEach(c => _saveContext(c));
        };
        fr.readAsText(f[0]);
        document.getElementById("import-file").value = '';
      };

     // FIXME: duplication of appVm function
    const _saveContext = (context = {}) => {
      storage.saveContext({name : context.name, variables : context.variables});
      const contextToEdit = contexts().find(ctx => ctx.name() === context.name);
      const contextVm = new ContextVm(context.name, context.variables);
      if(contextToEdit) {
        contexts.replace(contextToEdit, contextVm);
      } else {
        contexts.push(contextVm);
      }
    };

    const _handleExport = () => {
        const contextsModels = _extractContextFromVM(contexts());
        const exportContent = JSON.stringify(bookmarkProvider.exportObj(bookmarks(), contextsModels));
        const exportFile = new File([exportContent], "export.resting.json", {
          type: "application/json",
        });

        const url = URL.createObjectURL(exportFile);

        chrome.downloads.download({
            filename: exportFile.name,
            url: url,
            saveAs: true
        });
    };

    const _extractContextFromVM = (contexts = []) => {
      return contexts.map(c => ({name: c.name(), variables: _extractItemFromVM(c.variables())}));
    };

    const _extractItemFromVM = (items = []) => {
      return items.map(item => ({name: item.name(),value: item.value(),enabled: item.enabled()}))
    };


    $(() => {
      const screenWidth = screen.width;
      const dialogLeftPosition = screenWidth / 2  - 200;
      $('div.dialog').css('left', dialogLeftPosition+'px');

       // hide context menu on every click on page
       $(".row").on("click", function() {
        showContextMenu(false);
       });

    });

    // define the storage format conversion
    // this function converts format of bookmarks to the new version
    // consider to maintain the call until version <= 0.6.0 of web-extentsion for compatibility goal
    (() => {
      storage.iterate( value => {
        try {
         const bookmarkObj = bookmarkProvider.fromJson(value);
         bookmarkProvider.save(bookmarkObj);
        } catch(e) {
          console.log('bookmark/folder already converted in new format');
        }
      }, (err,success) => {
        if(!err) {
          _loadBookmarksNewFormat();
        }
      });

     // $("#import-file").change((event) => handleInput());
    })();


    return {
      showFolderDialog,
      showImportDialog,
      showExportDialog,
      folderName,
      folderDialog,
      importDialog,
      exportDialog,
      dismissFolderDialog,
      dismissImportDialog,
      dismissExportDialog,
      importSrc,
      exportSrc,
      addFolderOnEnter,
      addFolder,
      bookmarks,
      showBookmarkDeleteDialog,
      bookmarkToDeleteName,
      tryToDeleteFolder,
      deleteChildrenBookmarks,
      deleteBookmark,
      confirmDelete,
      dismissDeleteBookmarkDialog,
      deleteBookmarkFromView,
      loadBookmarkObj,
      expandFolder,
      importBookmarks,
      exportBookmarks,
      // context menu
      contextMenu,
      showContextMenu,
      contextMenuPosX,
      contextMenuPosY,
      // context menu actions
      duplicate,
    };
  }

});
