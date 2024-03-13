import { createRoot } from "react-dom/client";
import AddTaskPopup from "../pages/popup/AddTodo/AddTaskPopup";
import React from "react";
console.log('content.index.ts script')
const bodyElement = document.querySelector('body.lwp');
const newDiv = document.createElement('div');
bodyElement?.appendChild(newDiv);

const defaultButton = document.createElement('button');

const createAddTodoButton = function(workItemTitle: string) {
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
    button.onclick = () => {
        console.log('Button clicked');
        const root = createRoot(newDiv!);
        chrome.storage.local.get(['token'], (result) => {
            const token = result.token;
            console.log("get token: " + token);
            root.render(<AddTaskPopup isPopupVisible={true} accessToken={token} workItemTitle={workItemTitle}/>);
        });
    };

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
        let workItemTitle = "";
        elm.childNodes[0].childNodes.forEach(element => {
            if (element.nodeName == 'BUTTON') {
                hasButton = true;
                return;
            }
            if (element.nodeName == "DIV") {
                element.childNodes.forEach(child => {
                    if (child.nodeName == "A") {
                        workItemTitle = child.textContent ?? "";
                        console.log("title: " + workItemTitle);
                    }
                });
            }
        });
        if (hasButton) {
            return;
        }
        const button = createAddTodoButton(workItemTitle);
        console.log("append todo button on key " + String(key));
        elm.childNodes[0].appendChild(button);
    })
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
// Create an observer instance linked to the callback function
const bodyObserver = new MutationObserver(addButtonCallback);

// Start observing the target node for configured mutations
bodyObserver.observe(bodyElement!, config);