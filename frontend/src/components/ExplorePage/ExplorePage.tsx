import { TextField } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import { useLazyQuery, useQuery } from "@apollo/client";
import { SEARCH_USER, SEARCH_USER_FINAL } from "../../graphql/queries";
import { InputAdornment } from "@material-ui/core";
import { useDebounce } from "use-debounce";
import { Search } from "@material-ui/icons";
import Autocomplete, { AutocompleteRenderInputParams } from "@material-ui/lab/Autocomplete";
import { useHistory } from "react-router-dom";
import notification from "../Other/Notification";


const UserSearch = ({
  username,
  handleChange,
  handleBlur,
  setFinalUser,
}: {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  username: string;
  handleBlur: (e: React.FocusEvent<unknown>) => void;
  setFinalUser: (s: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) => {

  const [searchUser, { ...result }] = useLazyQuery(SEARCH_USER);
  const [debounceName] = useDebounce(username, 1500);
  const [options, setOptions] = useState<string[]>(result?.data?.searchUser === undefined ? [] : result?.data?.searchUser.map((user: {usersUsername: string, __typename: string}) => user.usersUsername));
  const [open, setOpen] = useState(false);
  const loading = open && options.length !== 0;

  useEffect(() => {
    if (debounceName !== "") {
      searchUser({ variables: { username: debounceName } });
      setOptions(result.data?.searchUser === undefined ? [] : result?.data?.searchUser.map((user: {usersUsername: string, __typename: string}) => user.usersUsername))
    }
  }, [debounceName]);

  useEffect(() => {
    if (result.data?.searchUser !== undefined) {
      setOptions(result.data?.searchUser.map((user: {usersUsername: string, __typename: string}) => user.usersUsername))
    } else {
      setOptions([])
    }
  }, [result.data]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event)
  }

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
      style={{width: "60vw", paddingRight: "1vw", justifyContent: "center", alignItems: "center", display: "flex"}}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false)
        setOptions([]);
      }}
      getOptionLabel={(option) => option}
      options={options}
      popupIcon={<div></div>}
      loading={loading}
      autoHighlight
      onChange={(event, newValue) => {setFinalUser(newValue as string)}}
      autoSelect
      noOptionsText="No users found"
      renderInput={(params: AutocompleteRenderInputParams) => (
        <TextField
          {...params}
          id="username"
          name="username"
          onBlur={handleBlur}
          onChange={onChange}
          style={{border: "2px solid black", borderRadius: 7, padding: 20}}
          value={username}
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

const ExplorePage = () => {
  const [finalUser, setFinalUser] = useState("");
  const {refetch} = useQuery(SEARCH_USER_FINAL, {variables: {username: finalUser}});
  const history = useHistory();
  
  const handleFinalSearch = async () => {
    const response = await refetch();
    return response
  }

  useEffect(() => {
    if (finalUser !== "") {
      handleFinalSearch()
        .then((response) => {
          if (response.data.searchUser.length === 1) {
            history.push(`/explore/${response.data.searchUser[0].usersUsername}`)
          } else {
            notification("Something went wrong.", "Your search was not precise enough or no user was found.", "info")
          }
        })
    }
  }, [finalUser]);

  return (
    <div
      style={{
        backgroundColor: "white",
        textAlign: "center",
        margin: 5,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h1>Explore</h1>
        <Formik
          initialValues={{ username: "" }}
          onSubmit={(value: { username: string }) => {
            setFinalUser(value.username)
          }}
        >
          {({ values, handleChange, handleBlur, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <UserSearch
                handleChange={handleChange}
                handleBlur={handleBlur}
                username={values.username}
                handleSubmit={handleSubmit}
                setFinalUser={setFinalUser}
              />
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ExplorePage;
