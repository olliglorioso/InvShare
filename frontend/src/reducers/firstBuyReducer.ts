// FirstBuyReducer and its action creators.
const firstBuyReducer = (state = true, action: { type: string }): boolean => {
    switch (action.type) {
    case "NO_PURCHASES":
        return false;
    case "FIRST_PURCHASE":
        return true;
    default:
        return state;
    }
};

export const buyFirstStock = () => {
    return {
        type: "FIRST_PURCHASE",
    };
};

export const noPurchases = () => {
    return {
        type: "NO_PURCHASES",
    };
};

export default firstBuyReducer;
