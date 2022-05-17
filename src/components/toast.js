import React from 'react';
import { SnackbarProvider, useSnackbar } from 'notistack';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const noop = () => {};

let success = noop;
let error = noop;
let warning = noop;
let info = noop;

const genFn = (enqueueSnackbar, variant) => (message, opts) => {
  enqueueSnackbar(message, {
    autoHideDuration: 3000,
    variant,
    ...opts,
  });
};

// eslint-disable-next-line react/prop-types
function ToastProvider({ children }) {
  const notistackRef = React.createRef();
  const onClickDismiss = key => () => {
    notistackRef.current.closeSnackbar(key);
  };

  return (
    <SnackbarProvider
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      ref={notistackRef}
      action={key => (
        <IconButton key="close" aria-label="close" color="inherit" onClick={onClickDismiss(key)} size="large">
          <CloseIcon style={{ fontSize: 16 }} />
        </IconButton>
      )}>
      <Toast />
      {children}
    </SnackbarProvider>
  );
}

function Toast() {
  const { enqueueSnackbar } = useSnackbar();

  success = genFn(enqueueSnackbar, 'success');
  error = genFn(enqueueSnackbar, 'error');
  warning = genFn(enqueueSnackbar, 'warning');
  info = genFn(enqueueSnackbar, 'info');

  return null;
}

export { ToastProvider };

export default {
  success: (...args) => success(...args),
  error: (...args) => error(...args),
  warning: (...args) => warning(...args),
  info: (...args) => info(...args),
};
