import { TextField } from "@material-ui/core";
import React, { useEffect } from "react";
import { Formik } from "formik";
import { useLazyQuery } from "@apollo/client";
import { SEARCH_USER } from "../../graphql/queries";
import { withStyles } from "@material-ui/styles";
import { InputAdornment } from "@material-ui/core";
import { CircularProgress } from "@material-ui/core";
import { useDebounce } from "use-debounce";
import { Search } from "@material-ui/icons";
import Autocomplete from "@material-ui/lab/Autocomplete";

const CssTextField = withStyles({
  root: {
    "& label.Mui-focused": {
      color: "grey",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "black",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "grey",
        borderRadius: 20,
      },
      "&:hover fieldset": {
        borderColor: "grey",
      },
      "&.Mui-focused fieldset": {
        borderColor: "black",
        borderWidth: 3,
      },
    },
  },
})(TextField);

const UserSearch = ({
  username,
  handleChange,
  handleBlur,
}: {
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  username: string;
  handleBlur: (e: React.FocusEvent<unknown>) => void;
}) => {

  const [searchUser, { ...result }] = useLazyQuery(SEARCH_USER);
  const [debounceName] = useDebounce(username, 1500);

  const [open, setOpen] = React.useState(false);
  const [options, setOptions] = React.useState<string[] | []>([]);
  const loading = open && options.length === 0;
  const topFilms = result?.data?.searchUser === undefined ? [] : result?.data?.searchUser.map((user: {username: string, __typename: string}) => user.username);
  
  
  useEffect(() => {
    if (debounceName !== "") {
      searchUser({ variables: { username: debounceName } });
    }
  }, [debounceName]);
  
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(event);
  };

  React.useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {

      if (active) {
        setOptions([...topFilms]);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  React.useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      id="asynchronous-demo"
      style={{width: 300}}
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      getOptionLabel={(option) => option}
      options={options}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          onChange={onChange}
          value={username}
          InputProps={{
            ...params.InputProps,
            
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );

  // useEffect(() => {
  //   if (debounceName !== "") {
  //     searchUser({ variables: { username: debounceName } });
  //   }
  // }, [debounceName]);

  // const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   handleChange(event);
  // };

  // return (
  //   <Autocomplete
  //     id="autocomplete-username"
  // options={options}
  // open={open}
  // onOpen={() => setOpen(true)}
  // onClose={() => setOpen(false)}
  // loading={loading}
  // getOptionLabel={(option) => option}
  // renderInput={(params) => (
  // <CssTextField
  //   id="username"
  //   autoComplete="off"
  //   type="username"
  //   onBlur={handleBlur}
  //   variant="outlined"
  //   name="username"
  //   onChange={onChange}
  //   value={username}
  //   InputProps={{
  //     startAdornment: (
  //       <InputAdornment position="start">
  //         <Search />
  //       </InputAdornment>
  //     ),
  //   }}
  // />
  // )}
  // />
  // );
};

const ExplorePage = () => {
  return (
    <div
      style={{
        backgroundColor: "white",
        textAlign: "center",
        paddingTop: "20vh",
        paddingBottom: "20vh",
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
        <Formik
          initialValues={{ username: "" }}
          onSubmit={(value: { username: string }) => {
            console.log(value);
          }}
        >
          {({ values, handleChange, handleBlur, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <UserSearch
                handleChange={handleChange}
                handleBlur={handleBlur}
                username={values.username}
              />
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ExplorePage;
