import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import * as redux from "react-redux";
import DefaultPage from "./DefaultPage";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const mockStore = configureMockStore([thunk]);

test("Default page renders correctly", () => {
    // test a component which includes useSelector hook from redux library
    const store = mockStore({
        user: {username: "koirakissa"}
    });
    const component = render(
        <div>
            <redux.Provider store={store}>
                <DefaultPage />
            </redux.Provider>
        </div>
    );
    component.debug();
    // Mock return value is "" => user is not logged in
    expect(component.container).toHaveTextContent("You are logged in.");
});