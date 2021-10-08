const modeSwitchReducer = (state = {mode: false}, action: {type: string}): {mode: boolean}=> {
    switch (action.type) {
    case "CHANGE_MODE":
        return {mode: !state.mode}
    default: 
        return state
    }
}

export const changeMode = () => {
    return {
        type: "CHANGE_MODE",
    }
}

export default modeSwitchReducer