import React from 'react';
import PropTypes from 'prop-types';

import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import { amber, green } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles';

const variantIcon = {
  success: CheckCircleIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const useStyles1 = makeStyles(theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.main,
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1),
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}));

function SnackbarContentWrapper(props) {
  const classes = useStyles1();
  // eslint-disable-next-line object-curly-newline
  const { className, message, onClose, variant, ...rest } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={[classes[variant], className].join(' ').trim()}
      message={
        // eslint-disable-next-line react/jsx-wrap-multilines
        <span id="client-snackbar" className={classes.message}>
          <Icon className={[classes.icon, classes.iconVariant].join(' ').trim()} />
          {message}
        </span>
      }
      action={[
        <IconButton key="close" aria-label="close" color="inherit" onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...rest}
    />
  );
}

SnackbarContentWrapper.propTypes = {
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['error', 'info', 'success', 'warning']),
};

SnackbarContentWrapper.defaultProps = {
  className: '',
  variant: 'success',
};

export default function Alert({ onClose, variant, message }) {
  const [open, setOpen] = React.useState(true);

  const handleClose = (e, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
    onClose();
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={6000}
      onClose={handleClose}>
      <SnackbarContentWrapper onClose={handleClose} variant={variant} message={message} />
    </Snackbar>
  );
}

Alert.propTypes = {
  message: PropTypes.string.isRequired,
  variant: PropTypes.string,
  onClose: PropTypes.func,
};

Alert.defaultProps = {
  variant: 'success',
  onClose: () => {},
};
