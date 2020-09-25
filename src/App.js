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
  "364375717000-m3dkm19ddi6blamm1bne7o0un0s54c3t.apps.googleusercontent.com";
const googleApiKey = "AIzaSyCNsY71HB1tD-UegkZ-Q6dE1pkmPwVikF4";

function App() {
  //variables for more User-Friendly UI
  const [signedIn, setSignedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingGoogleAuth, setLoadingGoogleAuth] = useState(true);
  const [responseErrorMessage, setResponseErrorMessage] = useState(null);

  /**
   *  XML File Handling
   *
   * moslty copied from https://dev.to/ilonacodes/frontend-shorts-how-to-read-content-from-the-file-input-in-react-1kfb
   */

  //Array with Youtube Channel List
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

  /**
   *  Google API Stuff ----------
   */

  /**
   *  Authentication
   *
   *  (is stored in State)
   */
  const [GoogleAuth, setGoogleAuth] = useState(null);
  const start = () => {
    // 2. Initialize the JavaScript client library.
    try {
      console.log("initializing gapi client");
      window.gapi.client
        .init({
          apiKey: googleApiKey,
          clientId: googleClientID,
          scope: "https://www.googleapis.com/auth/youtube",
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
          ],
        })
        .then(function () {
          setGoogleAuth(window.gapi.auth2.getAuthInstance());
        })
        .catch((error) => {
          console.error("Google API Client init Error:", error);
          setLoadingGoogleAuth(false);
          alert(error.details);
        });
    } catch (error) {
      console.error("Google Auth Error:", error);
    }
  };
  useEffect(() => {
    try {
      if (GoogleAuth) {
        console.log("Signed in?", GoogleAuth.isSignedIn.get());
        setSignedIn(GoogleAuth.isSignedIn.get());
        setUserData(GoogleAuth.currentUser.get().getBasicProfile());
        setLoadingGoogleAuth(false);
      }
    } catch (error) {
      console.error("Initialization error", error);
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
      window.gapi.load("youtube", "v3");
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
          GoogleAuth.signIn()
            .then((res) => {
              console.log("User signed in", res);
              setSignedIn(GoogleAuth.isSignedIn.get());
              setUserData(GoogleAuth.currentUser.get().getBasicProfile());
              setLoadingGoogleAuth(false);
            })
            .catch((error) => {
              console.log(error);
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
  /**
   *
   * Handling Youtube Subscriptions
   *
   */

  const subscribeToAllChannels = () => {
    try {
      if (GoogleAuth) {
        if (channelsToSubscribe.length > 0) {
          channelsToSubscribe.forEach((channel, index) => {
            const requestBody = {
              part: "id,snippet",
              snippet: {
                resourceId: {
                  kind: "youtube#channel",
                  channelId: channel.channelID,
                },
              },
            };
            window.gapi.client.youtube.subscriptions
              .insert(requestBody)
              .then((response) => {
                console.log("Response", response.status);
              })
              .catch((response) => JSON.parse(response.body))
              .then((res) => setResponseErrorMessage(res.error.message));
          });
        } else {
          alert("You need to import Subs first!");
        }
      } else {
        alert("You need to Authenticate First!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   *  React-UI-Code, Components are from Chakra-UI
   */
  return (
    <ThemeProvider>
      <CSSReset />
      <Box w="50%" ml="25%" h="100vh" pt="10px" d="flex" flexDirection="column">
        {/** Header --------------- */}
        <Box w="100%" textAlign="center">
          <Heading>Youtube Subscription Importer</Heading>
          <Heading as="h3" size="sm" mt="2">
            Made with{" "}
            <span role="img" aria-label="Coffee Emoji">
              ☕
            </span>{" "}
            and{" "}
            <span role="img" aria-label="Heart Emoji">
              ❤️
            </span>{" "}
            by{" "}
            <Link isExternal href="https://github.com/AnsgarH1" color="red.400">
              Ansgar Hoyer <Icon name="external-link" mx="2px" />
            </Link>
          </Heading>{" "}
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
          <Alert status="error" my="2">
            <AlertIcon />
            <Text>
              Googles Sign-In Account quota is currently exceeded. If you
              haven't authorized this Web-App in the past, you can't use it. I
              currently don't have the time to further maintain this project,
              but feel free to fork the{" "}
              <Link
                color="red.400"
                isExternal
                href="https://github.com/AnsgarH1/Youtube-Subscription-Importer"
              >
                Github Repository
              </Link>{" "}
              and host it on your own.
            </Text>
          </Alert>
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
            <Button
              my="4"
              bg="red.600"
              color="white"
              onClick={() => {
                setResponseErrorMessage(null);
                subscribeToAllChannels();
              }}
            >
              Subscribe to {channelsToSubscribe.length} Channels!
            </Button>
            {responseErrorMessage && (
              <Alert status="error" my="2">
                <AlertIcon />
                {responseErrorMessage}
              </Alert>
            )}
            {responseErrorMessage ===
              'The request cannot be completed because you have exceeded your <a href="/youtube/v3/getting-started#quota">quota</a>.' && (
              <Alert status="info" my="2">
                <AlertIcon />
                Please try again tomorrow. Googles API only allows a limited
                amount of requests per day.
              </Alert>
            )}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
