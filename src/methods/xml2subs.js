const xml2subs = (xml) => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");
    const nodes = xmlDoc.getElementsByTagName("outline");

    //nodes.forEach((node) => console.log(node.attributes[2]));

    const subs = [];
    const regex = /(UC)[A-Za-z0-9\-_]+/g;
    for (let i = 0; i < nodes.length; i++) {
      if (nodes.item(i).getAttribute("title") !== "YouTube Subscriptions") {
        const xmlUrl = nodes.item(i).getAttribute("xmlUrl");
        const channelID = xmlUrl.match(regex)[0];
        subs.push({
          channel: nodes.item(i).getAttribute("title"),
          xmlUrl: nodes.item(i).getAttribute("xmlUrl"),
          channelID,
        });
        
        console.log({
          channel: nodes.item(i).getAttribute("title"),
          xmlUrl: nodes.item(i).getAttribute("xmlUrl"),
          channelID,
        });
      }
    }
    console.log("Success! Extracted " + subs.length + " Channels!");
    return subs;
  } catch (error) {
    console.error(error);
    return { error };
  }
};

export { xml2subs };
