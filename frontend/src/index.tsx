import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import sidebarReducer from './reducers/sidebarReducer';
import { createStore } from 'redux';
import { Provider } from 'react-redux'

const store = createStore(sidebarReducer)
export type RootState = ReturnType<typeof store.getState>

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
