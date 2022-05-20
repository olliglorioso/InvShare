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
    const parsedUsername = parseUsername(username);
    const styles = useStyles();
    const [searchUser, { ...searchResult }] = useLazyQuery(SEARCH_USER);
    const [debounceName] = useDebounce(parsedUsername, 750);
    const [options, setOptions] = useState<string[]>(searchResult.data?.searchUser === undefined 
        ? [] 
        : searchResult.data?.searchUser.map((user: {usersUsername: string, __typename: string}) => user.usersUsername)
    );
    const [open, setOpen] = useState(false);
    const loading = open && options.length !== 0;
    useEffect(() => {
        if (debounceName !== "") {
            searchUser({ variables: { username: debounceName } });
        }
    }, [debounceName]);
    useEffect(() => {
        if (searchResult.data?.searchUser !== undefined) {
            setOptions(searchResult.data.searchUser.map((user: {usersUsername: string, __typename: string}) => user.usersUsername));
        } else {
            setOptions([]);
        }
    }, [searchResult.data]);
    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleChange(event);
    };
    useEffect(() => {
        let active = true;
        if (!loading) {
            return undefined;
        }
        (() => {
            if (active) {
                setOptions([...options]);
            }
        })();
        return () => {
            active = false;
        };
    }, [loading]);
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
            getOptionLabel={(option) => option}
            options={options}
            popupIcon={<div></div>}
            loading={loading}
            autoHighlight
            onChange={(_event, newValue) => {setFinalUser(newValue as string);}}
            autoSelect
            noOptionsText="No users found"
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
                        disableUnderline: true
                    }}
                />
            )}
        />
    );

};

export default UserSearch;