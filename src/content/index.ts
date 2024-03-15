console.log('content.index.ts script')
const bodyElement = document.querySelector('body.lwp');

const defaultButton = document.createElement('button');

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        if (request.greeting === "hello")
        sendResponse({farewell: "goodbye", data: getWorkItemList()});
    }
);

const getWorkItemList = function()
{
    const workItemTitleElements = document.querySelectorAll('td.bolt-tree-cell.bolt-table-cell.bolt-list-cell');

    const workItemList: (string | null | undefined)[] = [];
    // Add button for each workitem
    workItemTitleElements.forEach((elm: Element, key: number) => {
        const elementtext = elm.querySelector('.bolt-table-cell-content a')?.textContent
        workItemList.push(elementtext);
        console.log("Workitem title is: " + elementtext);
    })
    return workItemList;
}

const createAddTodoButton = function() {
    const button = document.createElement('button');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-label', 'Add to ToDo List');
    button.setAttribute('class', 'icon-only bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment');
    button.setAttribute('data-focuszone', 'focuszone-55');
    button.setAttribute('data-is-focusable', 'true');
    button.setAttribute('id', '__bolt-menu-button-51');
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.setAttribute('type', 'button');
    
    const span1 = document.createElement('span');
    span1.setAttribute('class', 'fluent-icons-enabled');
    
    const span2 = document.createElement('span');
    span2.setAttribute('aria-hidden', 'true');
    span2.setAttribute('class', 'left-icon flex-noshrink fabric-icon ms-Icon--Add medium');
    
    span1.appendChild(span2);
    button.appendChild(span1);

    return button;
}

const addToDoButtonToList = function() {
    const addButtonInner = function(elm: Element, key: number) {
        let hasButton = false
        elm.childNodes[0].childNodes.forEach(element => {
            if (element.nodeName == 'BUTTON') {
                hasButton = true;
                return;
            }
        });
        if (hasButton) {
            return;
        }
        const button = createAddTodoButton();
        console.log("append todo button on key " + String(key));
        elm.childNodes[0].appendChild(button);
    }

    const workItemTitleElements = document.querySelectorAll('td.bolt-tree-cell.bolt-table-cell.bolt-list-cell');
    console.log("workItemTitleElements count is: " + String(workItemTitleElements.length));
    if (workItemTitleElements) {
        workItemTitleElements.forEach(addButtonInner);
    }
}

// Observe table changes
// Options for the observer (which mutations to observe)
const config = { childList: true, subtree: true };

// Callback function to execute when mutations are observed
const addButtonCallback = (mutations: MutationRecord[], observer: MutationObserver): void => {
    let updating = false
    for (const mutation of mutations) {
        if (updating) {
            console.log("[Table]A child node is updating, skip.");
            return;
        }
      if (mutation.type === "childList") {
        console.log("[Table]A child node has been added or removed.");
        updating = true
        addToDoButtonToList();
      } else if (mutation.type === "attributes") {
        console.log(`[Table]The ${mutation.attributeName} attribute was modified.`);
      }
    }
    console.log("[Table]Add button callback finished.");
    updating = false
};

const addListenerToTbodyCallback = (mutations: MutationRecord[], observer: MutationObserver) => {
    let updating = false
    for (const mutation of mutations) {
        if (updating) {
            console.log("[addListenerToTbodyCallback]A child node is updating, skip.");
            return;
        }
      if (mutation.type === "childList") {
        console.log("[addListenerToTbodyCallback]Try to add listener to tbody.");
        updating = true
        const tbodyElement = document.querySelector('tbody.relative');
        if (tbodyElement) {
            const tableObs = new MutationObserver(addButtonCallback);
            tableObs.observe(tbodyElement, {childList: true, subtree: false});
            observer.disconnect();
        }
      } else if (mutation.type === "attributes") {
        console.log(`[addListenerToTbodyCallback]The ${mutation.attributeName} attribute was modified.`);
      }
    }
    updating = false;
}

// Create an observer instance linked to the callback function
const bodyObserver = new MutationObserver(addButtonCallback);

// Start observing the target node for configured mutations
bodyObserver.observe(bodyElement!, config);

// TODO: Add popup page on button click event.
