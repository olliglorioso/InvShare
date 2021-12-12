import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { FinalInformation } from "./BuyStocks";

test("FinalInformation renders correctly.", () => {
    const price = 20.0;
    const amount = "50";

    const component = render(<FinalInformation price={price} amount={amount} />);
    expect(component.container).toHaveTextContent("1000.00$");
});