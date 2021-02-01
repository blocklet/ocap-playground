import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';

import { SessionContext } from '@arcblock/did-playground';

const UserContext = React.createContext({});
const { Provider, Consumer } = UserContext;

function UserProvider({ children }) {
  const { session, api } = useContext(SessionContext);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [userInfo, setUserInfo] = useState();

  const getUser = async () => {
    setLoading(true);
    try {
      setError(null);
      const { data } = await api.get('/api/did/session');
      setUserInfo(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err);
    }
  };

  useEffect(() => {
    getUser({ silent: false });
  }, [session.user]); // eslint-disable-line

  if (loading) {
    return <CircularProgress />;
  }

  if (!session.user) {
    return null;
  }

  if (userInfo) {
    const value = {
      ...session,
      balance: userInfo.balance,
      token: userInfo.token,
      error,
    };
    return <Provider value={{ session: value }}>{children}</Provider>;
  }

  return null;
}

UserProvider.propTypes = {
  children: PropTypes.object,
};

UserProvider.defaultProps = {
  children: null,
};

function useUserContext() {
  const { user } = useContext(UserContext);
  return user;
}

export { UserContext, UserProvider, Consumer as UserConsumer, useUserContext };
