import { Dropdown, FocusTrapZone, IDropdownOption, Layer, Overlay, Popup, PrimaryButton, TextField, mergeStyleSets, Text } from '@fluentui/react';
import React, { useEffect, useState } from 'react';
import { addTask, getAllTaskLists } from './TodoFunctions';
import { TAddTaskPopupProps } from './addTaskPopup.types';

const AddTaskPopup = (props: TAddTaskPopupProps): JSX.Element => {
    const [category, setCategory] = React.useState<string>('');
    const [title, setTitle] = React.useState<string>(props.workItemTitle);
    const [isPopupVisible, setIsPopupVisible] = useState<boolean>(props.isPopupVisible);
    const [selectedTaskList, setSelectedTaskList] = useState<string>('');
    const [taskList, setTaskList] = useState<IDropdownOption[]>([]);
    const [addTaskSucceed, setAddTaskSucceed] = useState<boolean>(false);
    const [finished, setFinished] = useState<boolean>(false);

    const popupStyles = mergeStyleSets({
        root: {
          background: 'rgba(0, 0, 0, 0.2)',
          bottom: '0',
          left: '0',
          position: 'fixed',
          right: '0',
          top: '0',
        },
        content: {
          background: 'white',
          left: '50%',
          maxWidth: '400px',
          padding: '0 2em 2em',
          position: 'absolute',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        },
      });

    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setTitle(newValue ?? "");
    };
    const onChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setCategory(newValue ?? "");
    };
    const onClick = async () => {
        if (await addTask(props.accessToken, title, category, selectedTaskList)) {
            console.log('Task added');
            setAddTaskSucceed(true);
        } else {
            console.log('Task not added');
        }
        setFinished(true);
    };
    const onClickCancel = () => {
        setIsPopupVisible(false);
    };

    useEffect(() => {
        getTaskListOptions();
    }, []); 
    
    const getTaskListOptions = () => {
        let result: IDropdownOption[] = [];
        Promise.resolve(getAllTaskLists(props.accessToken)).then((lists) => {
            result = lists.map((list) => {
                return {
                    key: list.id,
                    text: list.displayName
                } as IDropdownOption
            });
            console.log("options: " + result.length);
            setTaskList(result);
        });
    }

    const onDropdownChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
        setSelectedTaskList(option?.key as string);
    }

    return (
        <>
        {isPopupVisible && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    onDismiss={onClickCancel}
                    role="dialog"
                    aria-modal="true"
                >
                    <Overlay onClick={onClickCancel} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2>Add To-do Task</h2>
                            <Dropdown label='Select Task List to Add' options={taskList} onChange={onDropdownChange}/>
                            <TextField label='Enter Category' onChange={onChange}/>
                            <TextField required label='Enter Title' onChange={onChangeTitle} defaultValue={props.workItemTitle}/>
                            <PrimaryButton text='Add' onClick={onClick}/>
                            <PrimaryButton text='Close' onClick={onClickCancel}/>
                            {finished && (addTaskSucceed ? <Text>Success!</Text> : <Text>Failed!</Text>)}
                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}
        </>
    );
};

export default AddTaskPopup;
