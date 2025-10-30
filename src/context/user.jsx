import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@mui/material/CircularProgress';

import { SessionContext } from '../components/did-playground';

const UserContext = createContext({});
const { Provider, Consumer } = UserContext;

function UserProvider({ children = null }) {
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
      ...userInfo,
      error,
    };
    return <Provider value={{ session: value }}>{children}</Provider>;
  }

  return null;
}

UserProvider.propTypes = {
  children: PropTypes.object,
};

function useUserContext() {
  const { user } = useContext(UserContext);
  return user;
}

export { UserContext, UserProvider, Consumer as UserConsumer, useUserContext };
