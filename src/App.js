//Client-ID 364375717000-ojqq73j0qrou6k0lomakl5bdplalptai.apps.googleusercontent.com
// API-Key AIzaSyCNsY71HB1tD-UegkZ-Q6dE1pkmPwVikF4
import React, { useState, useEffect } from "react";

import {
  Heading,
  Box,
  Text,
  Link,
  Button,
  ThemeProvider,
  CSSReset,
  Icon,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
} from "@chakra-ui/core";
import { xml2subs } from "./methods/xml2subs";

const googleClientID =
  "364375717000-ojqq73j0qrou6k0lomakl5bdplalptai.apps.googleusercontent.com";
const googleApiKey = "AIzaSyCNsY71HB1tD-UegkZ-Q6dE1pkmPwVikF4";

function App() {
  // Solution for Text-File Parsing, copied from https://dev.to/ilonacodes/frontend-shorts-how-to-read-content-from-the-file-input-in-react-1kfb
  const [channelsToSubscribe, setChannels] = useState([]);
  let fileReader;
  const handleFileRead = (e) => {
    const rawXML = fileReader.result;
    const extractedSubs = xml2subs(rawXML);
    setChannels(extractedSubs);
  };
  const handleFileChosen = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };

  // 
  const [signedIn, setSignedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingGoogleAuth, setLoadingGoogleAuth] = useState(true);

  //loading Google API (gapi)
  const [GoogleAuth, setGoogleAuth] = useState(null);
  const start = () => {
    // 2. Initialize the JavaScript client library.
    console.log("initializing gapi client");
    window.gapi.client
      .init({
        apiKey: googleApiKey,
        clientId: googleClientID,
        scope: "https://www.googleapis.com/auth/youtube",
      })
      .then(function () {
        setGoogleAuth(window.gapi.auth2.getAuthInstance());
      });
  };
  useEffect(() => {
    if (GoogleAuth) {
      console.log("Signed in?", GoogleAuth.isSignedIn.get());
      setSignedIn(GoogleAuth.isSignedIn.get());
      setUserData(GoogleAuth.currentUser.get().getBasicProfile());
      setLoadingGoogleAuth(false);
    }
  }, [GoogleAuth]);

  useEffect(() => {
    const htmlScript = document.createElement("script");
    htmlScript.type = "text/javascript";
    htmlScript.src = "https://apis.google.com/js/api.js";
    document.head.appendChild(htmlScript);
    htmlScript.onload = () => {
      console.log("Loaded Google API!");
      window.gapi.load("client", start);
    };
  }, []);

  const changeAuth = () => {
    setLoadingGoogleAuth(true);
    try {
      if (GoogleAuth != null) {
        if (GoogleAuth.isSignedIn.get()) {
          //User is signed in --> sign out
          GoogleAuth.signOut().then((res) => {
            console.log("User signed out", res);
            setSignedIn(GoogleAuth.isSignedIn.get());
            setUserData(GoogleAuth.currentUser.get().getBasicProfile());
            setLoadingGoogleAuth(false);
          });
        } else {
          // User is signed out --> sign in
          GoogleAuth.signIn().then((res) => {
            console.log("User signed in", res);
            setSignedIn(GoogleAuth.isSignedIn.get());
            setUserData(GoogleAuth.currentUser.get().getBasicProfile());
            setLoadingGoogleAuth(false);
          });
        }
      } else {
        console.error("Google Auth is not defined!");
        setLoadingGoogleAuth(false);
      }
    } catch (error) {
      console.error(error);
      setLoadingGoogleAuth(false);
    }
  };

  return (
    <ThemeProvider>
      <CSSReset />
      <Box w="50%" ml="25%" h="100vh" pt="10px" d="flex" flexDirection="column">
        {/** Header --------------- */}
        <Box w="100%" textAlign="center">
          <Heading>Youtube Subscription Importer</Heading>
          <Heading as="h4" size="sm" mt="2">
            Original from{" "}
            <Link
              isExternal
              color="red.400"
              href="https://github.com/evanreilly/youtube-subscriptions-importer"
            >
              Evan Reilly
              <Icon name="external-link" mx="2px" />
            </Link>
          </Heading>
        </Box>

        {/** Content */}
        <Box flex="1" my="20px">
          <Box>
            <Heading as="h3" size="md">
              1. Export Subscriptions from Youtube
            </Heading>
            <Text mt="2">
              In the first Step, you need to export your current subscriptions
              via the{" "}
              <Link
                href="https://www.youtube.com/subscription_manager"
                isExternal
                color="red.400"
              >
                Youtube Subscription Manager
                <Icon name="external-link" mx="2px" />
              </Link>
              from the old Youtube Account. On the bottom of the page is a
              Button "Export subscriptions", which should download an XML File.
            </Text>
          </Box>
          <Box my="20px">
            <Heading as="h3" size="md">
              2. Upload XML File
            </Heading>
            <Text>
              In the next Step, you need to Upload the XML-File to this Webapp:
            </Text>

            <FormControl my="4">
              <FormLabel htmlFor="xml-file-input">Upload File</FormLabel>
              <Input
                type="file"
                id="xml-file-input"
                accept=".xml"
                onChange={(event) => handleFileChosen(event.target.files[0])}
              />
            </FormControl>
          </Box>
          <Box my="20px">
            <Heading as="h3" size="md">
              3. Authorize Youtube
            </Heading>
            <Text mt="2">
              Here is the sketchiest part: To subscribe to Youtube Channels,
              this Web-App needs your Permission to controll your Youtube
              Account.
            </Text>
            <Text mt="2">
              The Button opens the Google Sign-In Dialog and will probably show
              a ton of warnings, because Google hasn't audited this project yet.
            </Text>
            {signedIn ? (
              <Button
                my="4"
                bg="red.600"
                color="white"
                variant="outline"
                onClick={changeAuth}
                isLoading={loadingGoogleAuth}
              >
                Sign out / Remove Authentication
              </Button>
            ) : (
              <Button
                my="4"
                bg="red.600"
                color="white"
                onClick={changeAuth}
                isLoading={loadingGoogleAuth}
              >
                Sign in / Authenticate
              </Button>
            )}

            {signedIn && (
              <Alert status="success">
                <AlertIcon />
                Logged in with {userData?.getEmail() || "undefined"}
              </Alert>
            )}
          </Box>
          <Box my="20px">
            <Heading as="h3" size="md">
              4. Subscripte via API
            </Heading>
            <Button my="4" bg="red.600" color="white" onClick={() => {}}>
              Subscribe to {channelsToSubscribe.length} Channels!
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;

/**
 * 
 *  // Google Authentication

  // Check if already Authenticated on Start
  useEffect(() => {
    let auth = async () =>
      Promise.resolve(
        loadAuth2(
          "364375717000-ojqq73j0qrou6k0lomakl5bdplalptai.apps.googleusercontent.com",
          "https://www.googleapis.com/auth/youtube.force-ssl"
        )
      );

    auth()
      .then((res) => {
        console.log(res);
        if (res.isSignedIn.get()) {
          setGAuth(res.currentUser.get().rt.Ad);
        } else {
          setGAuth(null);
        }
      })
      .then(() => loadClient());
  }, []);

  //Open Google Sign In Dialog
  const signIn = async () => {
    let auth2 = await loadAuth2(
      "364375717000-ojqq73j0qrou6k0lomakl5bdplalptai.apps.googleusercontent.com",
      "https://www.googleapis.com/auth/youtube.force-ssl"
    );
    auth2.signIn().then((response) => {
      console.log(response);
      setGAuth(response.rt.Ad);
    });
    setGAuth(gAuth);
  };

  //Sign out
  const signOut = async () => {
    let auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(() => {
      setGAuth(null);
      console.log("User signed out.");
    });
  };

  //loading Youtube Client API
  const loadClient = async () => {
    console.log(gapi);
    gapi.client.setApiKey("AIzaSyCNsY71HB1tD-UegkZ-Q6dE1pkmPwVikF4");
    return await gapi
      .load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(
        function () {
          console.log("GAPI client loaded for API");
        },
        function (err) {
          console.error("Error loading GAPI client for API", err);
        }
      );
  };
 */
