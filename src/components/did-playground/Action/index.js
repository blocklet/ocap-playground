import { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSize } from 'ahooks';
import useBrowser from '@arcblock/react-hooks/lib/useBrowser';
import { styled, useTheme } from '@arcblock/ux/lib/Theme';

import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import DidConnect from '@arcblock/did-connect/lib/Connect';
import Button from '@arcblock/ux/lib/Button';
import { mergeProps } from '@arcblock/ux/lib/Util';

import { SessionContext } from './session';
import { actions, getMessage, getActionName, getActionParams } from './actions';

function Close({ onClose }) {
  return <CloseContainer onClick={onClose}>&times;</CloseContainer>;
}

Close.propTypes = { onClose: PropTypes.func.isRequired };
const CloseContainer = styled('div')`
  display: ${(props) => (props.disableClose ? 'none' : 'block')};
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #999999;
  font-size: 2rem;
  line-height: 1rem;
  cursor: pointer;
  user-select: none;
`;

function PlaygroundAction(props) {
  const newProps = mergeProps(props, PlaygroundAction, ['buttonRounded', 'extraParams', 'timeout']);
  const {
    autoClose,
    action,
    buttonText,
    buttonColor,
    buttonVariant,
    buttonSize,
    buttonRounded,
    children,
    disableClose,
    title,
    scanMessage,
    successMessage,
    successUrl,
    successTarget,
    frameProps,
    confirmMessage,
    extraParams,
    timeout,
    webWalletUrl,
    ...rest
  } = newProps;

  const theme = useTheme();
  const browser = useBrowser();
  const { api, session } = useContext(SessionContext);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dynamicParams, setDynamicParams] = useState({});
  const size = useSize(document.body);
  const [success, setSuccess] = useState(false);
  const [showFrame, setShowFrame] = useState(success && successUrl && successTarget === 'frame');

  const width = size?.width || 0;

  // 当打开或关闭组件时，重置部分状态
  useEffect(
    () => () => {
      setSuccess(false);
      setShowFrame(false);
    },
    [open]
  );

  // If this is just a login button, we do not do anything actually
  if (action === 'login') {
    if (session.user) {
      return (
        <Button {...rest} rounded={buttonRounded} color={buttonColor} variant={buttonVariant} size={buttonSize}>
          {getMessage(successMessage || `Hello ${session.user.name}`, session)}
        </Button>
      );
    }

    return (
      <Button
        {...rest}
        rounded={buttonRounded}
        color={buttonColor}
        variant={buttonVariant}
        size={buttonSize}
        onClick={() => session.login()}>
        {getMessage(buttonText || title, session)}
      </Button>
    );
  }

  const config = actions[action];
  if (!actions[action]) {
    throw new Error(`Unsupported playground action ${action}`);
  }

  const doStart = async () => {
    if (typeof config.onStart === 'function') {
      try {
        setLoading(true);
        const params = await config.onStart(api, session);
        setDynamicParams(params);
        setLoading(false);
      } catch (err) {
        console.error(`Cannot generate dynamicParams for playground action ${getActionName(config, rest)}`);
      }
      setOpen(true);
    } else {
      setOpen(true);
    }
  };

  const onStart = async () => {
    if (!session.user) {
      session.login(doStart);
      return;
    }

    await doStart();
  };

  const onClose = () => setOpen(false);

  const onSuccess = () => {
    setSuccess(true);
    if (successUrl) {
      if (successTarget === 'frame') {
        setShowFrame(!!successUrl);
      } else if (successTarget === '_blank') {
        window.open(successUrl, '_blank');
      } else {
        window.open(successUrl, '_self');
      }
    } else if (children) {
      // Do nothing
    } else if (autoClose) {
      setTimeout(onClose, 2000);
    }
  };

  const renderRedirectUrlAfterSuccess = () => (
    <>
      <Close onClose={onClose} />
      <div>
        Redirecting to{' '}
        <a href={successUrl} target={successTarget}>
          {successUrl}
        </a>
      </div>
    </>
  );

  const renderFrameAfterSuccess = () => (
    <>
      <Close onClose={onClose} />
      <iframe
        style={{ width: '100%', height: '100%' }}
        allow="fullscreen"
        id="successFrame"
        title="successFrame"
        src={successUrl}
        {...frameProps}
      />
    </>
  );

  const showDidConnect = !successUrl || (successUrl && !success);

  return (
    <>
      <Button
        {...rest}
        rounded={buttonRounded}
        color={buttonColor}
        variant={buttonVariant}
        size={buttonSize}
        onClick={onStart}>
        {getMessage(buttonText || title, session)} {loading && <CircularProgress size={12} sx={{ color: '#fff' }} />}
      </Button>
      {open && !showDidConnect && (
        <Dialog
          open
          disableEscapeKeyDown
          fullScreen={width < theme.breakpoints.values.sm && !browser.wallet}
          fullWidth={showFrame}
          maxWidth={showFrame ? 'lg' : ''}>
          <DialogContent
            style={{
              padding: success && !showFrame && successUrl ? 55 : 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: showFrame ? theme.breakpoints.values.md : '',
            }}>
            <Close onClose={onClose} />
            {successUrl && success && !showFrame && renderRedirectUrlAfterSuccess()}
            {showFrame && renderFrameAfterSuccess()}
          </DialogContent>
        </Dialog>
      )}
      <DidConnect
        popup
        open={open && showDidConnect}
        action={getActionName(config, rest)}
        checkFn={api.get}
        onClose={onClose}
        onSuccess={onSuccess}
        checkTimeout={timeout}
        // 3 layers of extraParams: user props, dynamically generated, from other props
        extraParams={Object.assign(getActionParams(config, rest, session), dynamicParams, extraParams)}
        webWalletUrl={webWalletUrl}
        messages={{
          title: getMessage(title, session),
          scan: getMessage(scanMessage, session),
          confirm: getMessage(confirmMessage, session),
          success: children || getMessage(successMessage, session),
        }}
      />
    </>
  );
}

PlaygroundAction.propTypes = {
  action: PropTypes.string.isRequired,
  autoClose: PropTypes.bool,
  buttonText: PropTypes.string,
  buttonColor: PropTypes.string,
  buttonVariant: PropTypes.string,
  buttonSize: PropTypes.string,
  buttonRounded: PropTypes.bool,
  title: PropTypes.string.isRequired,
  scanMessage: PropTypes.string,
  successMessage: PropTypes.string,
  confirmMessage: PropTypes.string,
  extraParams: PropTypes.object,
  timeout: PropTypes.number,
  successUrl: PropTypes.string,
  successTarget: PropTypes.oneOf(['_blank', '_self', 'frame']),
  frameProps: PropTypes.object,
  webWalletUrl: PropTypes.string,
};

PlaygroundAction.defaultProps = {
  autoClose: true, // 只在没有 successUrl 属性下有效
  buttonText: '',
  buttonColor: 'primary', // primary | secondary | reverse | error
  buttonVariant: 'contained', // contained | outlined | default
  buttonSize: 'large', // small | large | medium
  buttonRounded: false,
  scanMessage: 'Scan the QRCode with your DID Wallet',
  confirmMessage: 'Confirm in your DID Wallet',
  successMessage: 'Operation success!',
  extraParams: {},
  timeout: 5 * 60 * 1000,
  successUrl: '',
  successTarget: '_self',
  frameProps: {},
  webWalletUrl: '',
};

export default PlaygroundAction;
