import React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import SignUpForm from "./SignUpForm";
import ADD_USER from "../../graphql/queries";
import { MockedProvider } from "@apollo/client/testing";
import { act } from "react-dom/test-utils";

test("Sign up form renders", () => {
    const mocks = [
        {
            request: {
                query: ADD_USER,
                variables: {
                    username: "testimies",
                    password: "testimies",
                },
            },
            result: {
                data: {
                    addUser: {
                        id: "1",
                        username: "testimies",
                        password: "testimies",
                    },
                },
            },
        },
    ];

    const component = render(
        <MockedProvider mocks={mocks} >
            <SignUpForm />
        </MockedProvider>
    );

    expect(component).toBeTruthy();
    expect(component.container).toHaveTextContent("Sign up");
    
    const usernameInput = component.container.querySelector("input[name='username']");
    const passwordInput = component.container.querySelector("input[name='password']");
    const passwordConfirmInput = component.container.querySelector("input[name='password_again']");
    const submitButton = component.container.querySelector("button[type='submit']");
    act(() => {
        fireEvent.change(usernameInput, { target: { value: "testimies" } });
        expect(usernameInput.value).toBe("testimies");
        fireEvent.change(passwordInput, { target: { value: "testimies" } });
        fireEvent.change(passwordConfirmInput, { target: { value: "testimies" } });
        fireEvent.click(submitButton);
    });
    
    expect(component).toBeTruthy();
});