import { getSession } from 'next-auth/client';

const withSession = (handler) => async (req, res) => {
  try {
    const session = await getSession({ req });
    if (!session) {
      throw new Error();
    }
    req.session = session;
    return handler(req, res);
  } catch (error) {
    return res.status(401).json({ message: 'Please authenticate' });
  }
};

export default withSession;
