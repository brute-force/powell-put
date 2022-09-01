import { Alert, Snackbar } from '@mui/material';
import PropTypes from 'prop-types';

function AlertSnackbar({ message, severity, open, setOpen }) {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

AlertSnackbar.propTypes = {
  message: PropTypes.string.isRequired,
  severity: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired
};

export default AlertSnackbar;
