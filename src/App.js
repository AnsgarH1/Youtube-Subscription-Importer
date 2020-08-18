import React, { useState } from "react";

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
} from "@chakra-ui/core";

function App() {
  // Solution for Text-File Parsing, copied from https://dev.to/ilonacodes/frontend-shorts-how-to-read-content-from-the-file-input-in-react-1kfb
  let fileReader;
  const handleFileRead = (e) => {
    const rawXML = fileReader.result;
  };
  const handleFileChosen = (file) => {
    fileReader = new FileReader();
    fileReader.onloadend = handleFileRead;
    fileReader.readAsText(file);
  };

  const [channelCount, setChannelCount] = useState(0);

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
              <FormLabel for="xml-file-input">Upload File</FormLabel>
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
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolorem
              voluptatum deserunt quis dolorum laudantium accusantium quod
              accusamus iusto voluptatem? Eius ipsam cum odit pariatur autem
              aliquid numquam sunt nemo non!
            </Text>
            <Button mt="4" bg="red.600" color="white">
              Open with Google
            </Button>
          </Box>
          <Box my="20px">
            <Heading as="h3" size="md">
              4. Subscripte via API
            </Heading>
            <Button my="4" bg="red.600" color="white">
              Subscripte to {channelCount} Channels!
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
