console.log('content.index.ts script')
const bodyElement = document.querySelector('body.lwp');

const defaultButton = document.createElement('button');

const createAddTodoButton = function() {
    const button = document.createElement('button');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-label', '');
    button.setAttribute('aria-roledescription', 'button');
    button.setAttribute('class', 'bolt-button bolt-icon-button enabled bolt-focus-treatment');
    button.setAttribute('data-focuszone', 'focuszone-3');
    button.setAttribute('data-is-focusable', 'true');
    button.setAttribute('id', '__bolt-new-option_add_todo');
    button.setAttribute('role', 'menuitem');
    button.setAttribute('tabindex', '0');
    button.setAttribute('type', 'button');
    
    const span1 = document.createElement('span');
    span1.setAttribute('class', 'fluent-icons-enabled');
    
    const span2 = document.createElement('span');
    span2.setAttribute('aria-hidden', 'true');
    span2.setAttribute('class', 'left-icon flex-noshrink fabric-icon ms-Icon--Add medium');
    
    const span3 = document.createElement('span');
    span3.setAttribute('class', 'bolt-button-text body-m');
    span3.textContent = 'Add Todo';
    
    const span4 = document.createElement('span');
    span4.setAttribute('class', 'fluent-icons-enabled');
    
    button.appendChild(span1);
    span1.appendChild(span2);
    button.appendChild(span3);
    button.appendChild(span4);

    return button;
}

const addToDoButtonToList = function() {
    const workItemTitleElements = document.querySelectorAll('td[aria-colindex="4"][class="bolt-tree-cell bolt-table-cell bolt-list-cell"][data-column-index="3"]');
    console.log("Workitem count is: " + String(workItemTitleElements.length));
    if (!workItemTitleElements) {
        return;
    }
    // Add button for each workitem
    workItemTitleElements.forEach((elm: Element, key: number) => {
        let hasButton = false
        elm.childNodes[0].childNodes.forEach(element => {
            if (element.nodeName == 'BUTTON') {
                hasButton = true;
                return;
            }
        });
        if (hasButton) {
            console.log("Skip add todo button on key " + String(key));
            return;
        }
        const button = createAddTodoButton();
        console.log("append todo button on key " + String(key));
        elm.childNodes[0].appendChild(button);
    })
}

// Observe table changes
// Options for the observer (which mutations to observe)
const config = { attributes: true, childList: true, subtree: true };

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
// Create an observer instance linked to the callback function
const bodyObserver = new MutationObserver(addButtonCallback);

// Start observing the target node for configured mutations
bodyObserver.observe(bodyElement!, config);

// TODO: Add popup page on button click event.
