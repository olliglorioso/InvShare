import React, {useState, useEffect} from "react";
import { InputAdornment } from "@material-ui/core";
import { useDebounce } from "use-debounce";
import { Search } from "@material-ui/icons";
import Autocomplete, { AutocompleteRenderInputParams } from "@material-ui/lab/Autocomplete";
import { TextField } from "@material-ui/core";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_USER } from "../../graphql/queries";
import { HandleChangeType, HandleSubmitType } from "../../tsUtils/types";
import useStyles from "./exploreRouteStyles.module";
import { parseUsername } from "../../tsUtils/typeGuards";

// This component takes care for the text field for searching users (and the queries)
const UserSearch = ({
    username,
    handleChange,
    handleBlur,
    setFinalUser,
}: {
  handleChange: HandleChangeType
  username: string;
  handleBlur: (e: React.FocusEvent<unknown>) => void;
  setFinalUser: (s: string) => void;
  handleSubmit: HandleSubmitType;
}) => {
    // Parsing the username.
    const parsedUsername = parseUsername(username);
    // Importing styles.
    const styles = useStyles();
    // Lazy query (it will be executed later when its searchUser-function is called) initialized.
    const [searchUser, { ...searchResult }] = useLazyQuery(SEARCH_USER);
    // We are using useDebounce to prevent the query from being executed too often.
    const [debounceName] = useDebounce(parsedUsername, 750);
    // Options for the Autocomplete-component. The options are the users that are returned from the lazy query.
    // Only the usernames of search result objects are included in the options.
    const [options, setOptions] = useState<string[]>(searchResult.data?.searchUser === undefined 
        ? [] 
        : searchResult.data?.searchUser.map((user: {usersUsername: string, __typename: string}) => user.usersUsername)
    );
    // This determines if the search results are shown or not (Autocomplete).
    const [open, setOpen] = useState(false);
    // This variable determines if the loading-circle is shown.
    const loading = open && options.length !== 0;
    // Every time the debounced username changes, the searchUser-function is called. This happens 750 milliseconds after the last change in the text field.
    useEffect(() => {
        if (debounceName !== "") {
            searchUser({ variables: { username: debounceName } });
        }
    }, [debounceName]);
    // When the search result query is ready and the data changes, we change the Autocomplete-options
    // to the list of the query-results. If there are no results, we set the options to an empty array.
    useEffect(() => {
        if (searchResult.data?.searchUser !== undefined) {
            setOptions(searchResult.data.searchUser.map((user: {usersUsername: string, __typename: string}) => user.usersUsername));
        } else {
            setOptions([]);
        }
    }, [searchResult.data]);
    // On change.
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(event);
    };
    // This useEffect is executed every time loading-variable changes.
    useEffect(() => {
        // A helping variable initialized.
        let active = true;
        // If the loading-variable is false, we do nothing.
        if (!loading) {
            return undefined;
        }
        // Otherwise, if the active is true, we set options to match the options-variable.
        (() => {
            if (active) {
                setOptions([...options]);
            }
        })();
        // At the end, active is set to false.
        return () => {
            active = false;
        };
    }, [loading]);
    // Returning the search field and autocomplete.
    return (
        <Autocomplete
            id="username"
            className={styles.autoComplete}
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
                setOptions([]);
            }}
            // Options label is the username.
            getOptionLabel={(option) => option}
            options={options}
            // We want no popupIcon.
            popupIcon={<div></div>}
            loading={loading}
            // Autohiglight the first option.
            autoHighlight
            onChange={(_event, newValue) => {setFinalUser(newValue as string);}}
            // Autoselect the first option.
            autoSelect
            // If there are no options.
            noOptionsText="No users found"
            // Text input component.
            renderInput={(params: AutocompleteRenderInputParams) => (
                <TextField
                    {...params}
                    id="username"
                    name="username"
                    onBlur={handleBlur}
                    onChange={onChange}
                    className={styles.searchField}
                    value={parsedUsername}
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                        // Disabling the default underline.
                        disableUnderline: true
                    }}
                />
            )}
        />
    );

};

export default UserSearch;