import "../styles/globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";

function MyApp({ Component, pageProps }) {
  // Checl if component has getLayout function, if not, return just page itself
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <UserProvider>
      {
        // Pass AppLayout to every component in the app
        getLayout(<Component {...pageProps} />, pageProps)
      }
    </UserProvider>
  );
}

export default MyApp;
