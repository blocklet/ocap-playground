import { createAuthServiceSessionContext } from '@arcblock/did-connect-react/lib/Session';

const { SessionProvider, SessionContext, SessionConsumer, withSession } = createAuthServiceSessionContext();
export { SessionProvider, SessionContext, SessionConsumer, withSession };
