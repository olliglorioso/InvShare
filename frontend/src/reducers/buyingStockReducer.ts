// BuyingStockReducer and its actions creators.
const buyingStockReducer = (
    state = { stockName: "", stockPrice: 0.0 },
    action: { type: string; stock: string; price: number }
): { stockName: string; stockPrice: number } => {
    switch (action.type) {
    case "CHANGE_STOCK":
        return { ...state, stockName: action.stock };
    case "CHANGE_PRICE":
        return { ...state, stockPrice: action.price };
    default:
        return state;
    }
};

export const changeStock = (
    stock: string
): { type: string; stock: string; price: number } => {
    return {
        type: "CHANGE_STOCK",
        stock: stock,
        price: 0.0,
    };
};

export const changePrice = (
    price: number
): { type: string; stock: string; price: number } => {
    return {
        type: "CHANGE_PRICE",
        stock: "moikka",
        price: price,
    };
};

export default buyingStockReducer;
