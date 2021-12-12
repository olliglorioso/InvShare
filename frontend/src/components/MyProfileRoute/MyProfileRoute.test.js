import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import TutorialAnimation from "./TutorialAnimation";

test("Tutorial animation renders", () => {
    const component = render(<TutorialAnimation />);
    expect(component).toBeTruthy();
    expect(component.container).toHaveTextContent("Open the sidebar!");
});